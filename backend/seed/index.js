require("dotenv").config();

const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const Progress = require("../models/Progress");

const neetcode150 = require("./neetcode150");
const blind75 = require("./blind75");
const neetcode250 = require("./neetcode250");
const striverA2Z = require("./striverA2Z");
const striver79 = require("./striver79");

const SHEETS = [
  ["neetcode150", neetcode150],
  ["blind75", blind75],
  ["neetcode250", neetcode250],
  ["striverA2Z", striverA2Z],
  ["striver79", striver79],
];

function placementFromEntry(entry, sheet) {
  return {
    sheet,
    category: entry.category,
    pattern: entry.pattern || entry.category,
    order: entry.order,
  };
}

function samePlacement(a, b) {
  return (
    a.sheet === b.sheet &&
    a.category === b.category &&
    a.pattern === b.pattern &&
    a.order === b.order
  );
}

function mergePlacements(existing = [], incoming = []) {
  const merged = [...existing];

  for (const placement of incoming) {
    if (!merged.some((item) => samePlacement(item, placement))) {
      merged.push(placement);
    }
  }

  return merged.sort((a, b) => {
    if (a.sheet !== b.sheet) {
      return a.sheet.localeCompare(b.sheet);
    }

    return Number(a.order || 0) - Number(b.order || 0);
  });
}

/*
 * Safely convert either:
 *
 * {
 *   neetcode150: "Arrays & Hashing"
 * }
 *
 * OR:
 *
 * [
 *   ["neetcode150", "Arrays & Hashing"]
 * ]
 *
 * into a normal object.
 */
function toPlainObject(value) {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    return Object.fromEntries(value);
  }

  if (typeof value === "object") {
    return value;
  }

  return {};
}

/*
 * ---------------------------------------------------------
 * MIGRATE OLD DUPLICATE PROBLEMS
 * ---------------------------------------------------------
 */

async function migrateLegacyDuplicates() {
  const docs = await Problem.find({}).lean();

  const groups = new Map();

  for (const doc of docs) {
    const key = doc.canonicalKey || doc.slug;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(doc);
  }

  for (const [key, group] of groups) {
    if (group.length <= 1) {
      continue;
    }

    console.log(
      `Consolidating duplicate problem: ${key}`
    );

    const keeper = group[0];

    let placements = [];

    for (const doc of group) {
      /*
       * New placement format
       */
      if (Array.isArray(doc.placements)) {
        placements = mergePlacements(
          placements,
          doc.placements
        );
      }

      /*
       * Old categoryBySheet format
       */
      const categories = toPlainObject(
        doc.categoryBySheet
      );

      const patterns = toPlainObject(
        doc.patternBySheet
      );

      const orders = doc.sheetOrder || {};

      for (const sheet of
        doc.sheets || Object.keys(categories)) {
        if (
          categories[sheet] &&
          orders[sheet] != null
        ) {
          const candidate = {
            sheet,
            category: categories[sheet],
            pattern:
              patterns[sheet] ||
              categories[sheet],
            order: orders[sheet],
          };

          placements = mergePlacements(
            placements,
            [candidate]
          );
        }
      }

      /*
       * Very old representation where the
       * sheet was stored directly.
       */
      if (
        doc.category &&
        Array.isArray(doc.sheets) &&
        doc.sheets.length === 1 &&
        doc.order != null
      ) {
        const sheet = doc.sheets[0];

        placements = mergePlacements(
          placements,
          [
            {
              sheet,
              category: doc.category,
              pattern:
                doc.pattern ||
                doc.category,
              order: doc.order,
            },
          ]
        );
      }
    }

    /*
     * -------------------------------------------------------
     * PRESERVE PROGRESS FROM DUPLICATE RECORDS
     * -------------------------------------------------------
     */

    const duplicateIds = group
      .slice(1)
      .map((doc) => doc._id);

    for (const duplicateId of duplicateIds) {
      const progressRows =
        await Progress.find({
          problemId: duplicateId,
        }).lean();

      for (const row of progressRows) {
        const existing =
          await Progress.findOne({
            userId: row.userId,
            problemId: keeper._id,
          });

        if (!existing) {
          await Progress.updateOne(
            {
              _id: row._id,
            },
            {
              $set: {
                problemId: keeper._id,
              },
            }
          );

          continue;
        }

        const merged = {
          status:
            existing.status === "solved" ||
            row.status === "solved"
              ? "solved"
              : existing.status === "attempted" ||
                  row.status === "attempted"
                ? "attempted"
                : "todo",

          saved: Boolean(
            existing.saved || row.saved
          ),

          important: Boolean(
            existing.important ||
              row.important
          ),

          needsRevision: Boolean(
            existing.needsRevision ||
              row.needsRevision
          ),

          notes:
            existing.notes ||
            row.notes ||
            "",

          revisionCount: Math.max(
            existing.revisionCount || 0,
            row.revisionCount || 0
          ),

          lastRevisedAt:
            existing.lastRevisedAt &&
            row.lastRevisedAt
              ? new Date(
                  existing.lastRevisedAt
                ) >
                new Date(
                  row.lastRevisedAt
                )
                ? existing.lastRevisedAt
                : row.lastRevisedAt
              : existing.lastRevisedAt ||
                row.lastRevisedAt ||
                null,
        };

        await Progress.updateOne(
          {
            _id: existing._id,
          },
          {
            $set: merged,
          }
        );

        await Progress.deleteOne({
          _id: row._id,
        });
      }
    }

    const sheets = [
      ...new Set(
        placements.map(
          (placement) => placement.sheet
        )
      ),
    ];

    const first = group[0];
    const knownDifficulty =
      group.find((doc) => doc.difficulty && doc.difficulty !== "Unknown")?.difficulty ||
      first.difficulty;

    await Problem.updateOne(
      {
        _id: keeper._id,
      },
      {
        $set: {
          title: first.title,
          slug: first.slug,
          canonicalKey: key,
          link: first.link,
          difficulty: knownDifficulty,

          category:
            placements[0]?.category ||
            first.category ||
            "Uncategorized",

          pattern:
            placements[0]?.pattern ||
            first.pattern ||
            "Uncategorized",

          placements,
          sheets,
        },
      }
    );

    await Problem.deleteMany({
      _id: {
        $in: duplicateIds,
      },
    });
  }
}

/*
 * ---------------------------------------------------------
 * REMOVE CONFLICTING INDEXES
 * ---------------------------------------------------------
 */

async function removeConflictingIndexes() {
  const collection = Problem.collection;

  const indexes =
    await collection.indexes();

  for (const index of indexes) {
    /*
     * MongoDB allows only ONE text index
     * per collection.
     *
     * Old:
     * title_text_pattern_text_category_text
     *
     * New:
     * title_text_canonicalKey_text
     */
    if (
      index.key &&
      index.key._fts === "text"
    ) {
      console.log(
        `Removing legacy text index: ${index.name}`
      );

      await collection
        .dropIndex(index.name)
        .catch((err) => {
          console.warn(
            `Could not remove text index ${index.name}:`,
            err.message
          );
        });

      continue;
    }

    /*
     * Remove old canonicalKey / slug indexes.
     * The current Problem schema will recreate
     * the correct ones.
     */
    if (
      index.name === "canonicalKey_1" ||
      index.name === "slug_1"
    ) {
      console.log(
        `Removing legacy index: ${index.name}`
      );

      await collection
        .dropIndex(index.name)
        .catch(() => {});
    }
  }
}

/*
 * ---------------------------------------------------------
 * REBUILD INDEXES
 * ---------------------------------------------------------
 */

async function rebuildIndexes() {
  await removeConflictingIndexes();

  /*
   * Create indexes according to the CURRENT
   * Problem schema.
   */
  await Problem.syncIndexes();
}

/*
 * ---------------------------------------------------------
 * SEED ONE SHEET
 * ---------------------------------------------------------
 */

async function seedSheet(entries, sheet) {
  /*
   * Multiple source entries can point to the
   * same canonical problem.
   *
   * Example:
   *
   * Maximum Subarray
   *   → Arrays & Hashing
   *   → Greedy
   *
   * Both placements are preserved.
   */

  const byCanonical = new Map();

  for (const entry of entries) {
    if (!entry.canonicalKey) {
      throw new Error(
        `Missing canonicalKey for "${entry.title}" in ${sheet}`
      );
    }

    if (!byCanonical.has(
      entry.canonicalKey
    )) {
      byCanonical.set(
        entry.canonicalKey,
        {
          ...entry,
          placements: [],
        }
      );
    }

    byCanonical
      .get(entry.canonicalKey)
      .placements
      .push(
        placementFromEntry(
          entry,
          sheet
        )
      );
  }

  /*
   * Insert/update canonical problems.
   */

  for (const entry of
    byCanonical.values()) {
    const existing =
      await Problem.findOne({
        canonicalKey:
          entry.canonicalKey,
      });

    /*
     * NEW PROBLEM
     */
    if (!existing) {
      const placements =
        mergePlacements(
          [],
          entry.placements
        );

      await Problem.create({
        title: entry.title,

        slug: entry.slug,

        canonicalKey:
          entry.canonicalKey,

        link: entry.link,

        difficulty:
          entry.difficulty,

        category:
          placements[0]?.category ||
          entry.category ||
          "Uncategorized",

        pattern:
          placements[0]?.pattern ||
          entry.pattern ||
          entry.category ||
          "Uncategorized",

        placements,

        sheets: [
          ...new Set(
            placements.map(
              (placement) =>
                placement.sheet
            )
          ),
        ],
      });

      continue;
    }

    /*
     * EXISTING PROBLEM
     */

    const placements =
      mergePlacements(
        existing.placements || [],
        entry.placements
      );

    const sheets = [
      ...new Set(
        placements.map(
          (placement) =>
            placement.sheet
        )
      ),
    ];

    // NeetCode 250's source data doesn't have real difficulty values yet
    // (everything in it is "Unknown"). Since it's seeded last and shares
    // most problems with NeetCode 150 / Blind 75, blindly trusting
    // entry.difficulty here would overwrite a correct "Easy/Medium/Hard"
    // already stored from an earlier sheet with "Unknown". Keep whichever
    // value is actually known.
    const resolvedDifficulty =
      entry.difficulty && entry.difficulty !== "Unknown"
        ? entry.difficulty
        : existing.difficulty || entry.difficulty;

    await Problem.updateOne(
      {
        _id: existing._id,
      },
      {
        $set: {
          title: entry.title,

          link: entry.link,

          difficulty:
            resolvedDifficulty,

          placements,

          sheets,

          category:
            placements[0]?.category ||
            entry.category ||
            "Uncategorized",

          pattern:
            placements[0]?.pattern ||
            entry.pattern ||
            entry.category ||
            "Uncategorized",
        },
      }
    );
  }

  /*
   * -------------------------------------------------------
   * REMOVE STALE PLACEMENTS FOR THIS SHEET
   * -------------------------------------------------------
   */

  const activePlacements =
    new Set(
      entries.map((entry) => {
        const pattern =
          entry.pattern ||
          entry.category;

        return [
          entry.canonicalKey,
          sheet,
          entry.category,
          pattern,
          entry.order,
        ].join("|");
      })
    );

  const current =
    await Problem.find({
      "placements.sheet": sheet,
    });

  for (const problem of current) {
    const originalPlacements =
      problem.placements || [];

    const kept =
      originalPlacements.filter(
        (placement) => {
          /*
           * Placement belongs to another sheet.
           * Always preserve it.
           */
          if (
            placement.sheet !== sheet
          ) {
            return true;
          }

          const key = [
            problem.canonicalKey,
            sheet,
            placement.category,
            placement.pattern,
            placement.order,
          ].join("|");

          return activePlacements.has(
            key
          );
        }
      );

    /*
     * No placements remain anywhere.
     */
    if (!kept.length) {
      await Problem.deleteOne({
        _id: problem._id,
      });

      continue;
    }

    const sheets = [
      ...new Set(
        kept.map(
          (placement) =>
            placement.sheet
        )
      ),
    ];

    const changed =
      JSON.stringify(kept) !==
      JSON.stringify(
        originalPlacements
      );

    if (changed) {
      await Problem.updateOne(
        {
          _id: problem._id,
        },
        {
          $set: {
            placements: kept,

            sheets,

            category:
              kept[0]?.category ||
              "Uncategorized",

            pattern:
              kept[0]?.pattern ||
              "Uncategorized",
          },
        }
      );
    }
  }
}

/*
 * ---------------------------------------------------------
 * COUNT PLACEMENTS
 * ---------------------------------------------------------
 */

async function getPlacementCount(
  sheet
) {
  const result =
    await Problem.aggregate([
      {
        $unwind: "$placements",
      },

      {
        $match: {
          "placements.sheet": sheet,
        },
      },

      {
        $count: "count",
      },
    ]);

  return result[0]?.count || 0;
}

/*
 * ---------------------------------------------------------
 * MAIN SEED
 * ---------------------------------------------------------
 */

async function seed() {
  try {
    /*
     * Don't allow Mongoose to automatically create
     * indexes before migration is complete.
     */
    mongoose.set(
      "autoIndex",
      false
    );

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected for seeding"
    );

    /*
     * 1. Consolidate legacy duplicates.
     */
    await migrateLegacyDuplicates();

    /*
     * 2. Seed all three sheets.
     */
    for (const [
      sheet,
      entries,
    ] of SHEETS) {
      console.log(
        `Seeding ${sheet}: ${entries.length} source entries`
      );

      await seedSheet(
        entries,
        sheet
      );
    }

    /*
     * 3. Fix legacy/conflicting indexes.
     */
    await rebuildIndexes();

    /*
     * 4. Calculate final counts.
     */
    const uniqueProblems =
      await Problem.countDocuments();

    const neetcode150Count =
      await getPlacementCount(
        "neetcode150"
      );

    const blind75Count =
      await getPlacementCount(
        "blind75"
      );

    const neetcode250Count =
      await getPlacementCount(
        "neetcode250"
      );

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "DSA Hunt Seed Complete"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Unique stored problems: ${uniqueProblems}`
    );

    console.log(
      `NeetCode 150 placements: ${neetcode150Count}`
    );

    console.log(
      `Blind 75 placements: ${blind75Count}`
    );

    console.log(
      `NeetCode 250 supplied placements: ${neetcode250Count}`
    );

    console.log(
      "========================================"
    );
  } catch (err) {
    console.error(
      "Seed error:",
      err
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();