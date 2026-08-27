const express = require("express");
const Problem = require("../models/Problem");
const Progress = require("../models/Progress");

const router = express.Router();

const DEFAULT_PROGRESS = {
  status: "todo",
  saved: false,
  important: false,
  needsRevision: false,
  notes: "",
  revisionCount: 0,
  lastRevisedAt: null,
};

const VALID_SHEETS = new Set([
  "neetcode150",
  "blind75",
  "neetcode250",
]);

const VALID_DIFFICULTIES = new Set([
  "Easy",
  "Medium",
  "Hard",
]);

function getSheet(req) {
  const sheet = req.query.sheet || "neetcode150";

  return VALID_SHEETS.has(sheet)
    ? sheet
    : "neetcode150";
}

function getDifficulty(req) {
  const difficulty = String(
    req.query.difficulty || ""
  ).trim();

  if (!difficulty) {
    return "";
  }

  return VALID_DIFFICULTIES.has(difficulty)
    ? difficulty
    : "";
}

function getPlacements(problem, sheet, category = "") {
  return (problem.placements || [])
    .filter(
      (placement) =>
        placement.sheet === sheet &&
        (!category || placement.category === category)
    )
    .sort(
      (a, b) =>
        Number(a.order || 0) -
        Number(b.order || 0)
    );
}

function present(problem, placement, progress) {
  return {
    _id: problem._id,
    title: problem.title,
    slug: problem.slug,
    link: problem.link,

    // IMPORTANT:
    // Explicitly send difficulty to frontend.
    difficulty: problem.difficulty || "Unknown",

    sheets: problem.sheets || [],

    category: placement.category,
    pattern: placement.pattern,
    displayOrder: placement.order,
    sheet: placement.sheet,

    progress:
      progress || DEFAULT_PROGRESS,
  };
}

function buildPlacementMatch(sheet, category) {
  const match = {
    sheet,
  };

  if (category) {
    match.category = category;
  }

  return match;
}

function buildSearchQuery(
  sheet,
  category,
  search,
  difficulty
) {
  const placementMatch =
    buildPlacementMatch(sheet, category);

  const base = {
    placements: {
      $elemMatch: placementMatch,
    },
  };

  const conditions = [base];

  // Difficulty filter
  if (difficulty) {
    conditions.push({
      difficulty,
    });
  }

  // Search filter
  if (search?.trim()) {
    const q = search.trim();

    const or = [
      {
        title: {
          $regex: q,
          $options: "i",
        },
      },

      {
        canonicalKey: {
          $regex: q,
          $options: "i",
        },
      },

      {
        placements: {
          $elemMatch: {
            ...placementMatch,
            category: {
              $regex: q,
              $options: "i",
            },
          },
        },
      },

      {
        placements: {
          $elemMatch: {
            ...placementMatch,
            pattern: {
              $regex: q,
              $options: "i",
            },
          },
        },
      },
    ];

    if (/^\d+$/.test(q)) {
      or.push({
        placements: {
          $elemMatch: {
            ...placementMatch,
            order: Number(q),
          },
        },
      });
    }

    conditions.push({
      $or: or,
    });
  }

  if (conditions.length === 1) {
    return base;
  }

  return {
    $and: conditions,
  };
}

async function getProgressMap(userId) {
  const rows = await Progress.find({
    userId,
  }).lean();

  return new Map(
    rows
      .filter((row) => row.problemId)
      .map((row) => [
        row.problemId.toString(),
        row,
      ])
  );
}

/*
|--------------------------------------------------------------------------
| GET /api/problems
|--------------------------------------------------------------------------
*/
router.get("/", async (req, res) => {
  try {
    const sheet = getSheet(req);
    const category = req.query.category || "";
    const difficulty = getDifficulty(req);
    const search = req.query.search || "";

    const filter = buildSearchQuery(
      sheet,
      category,
      search,
      difficulty
    );

    let problems = await Problem.find(
      filter
    ).lean();

    const progressMap =
      await getProgressMap(req.user._id);

    const rows = [];

    for (const problem of problems) {
      const placements = getPlacements(
        problem,
        sheet,
        category
      );

      for (const placement of placements) {
        rows.push(
          present(
            problem,
            placement,
            progressMap.get(
              problem._id.toString()
            )
          )
        );
      }
    }

    rows.sort(
      (a, b) =>
        Number(a.displayOrder || 0) -
        Number(b.displayOrder || 0)
    );

    if (req.query.status) {
      const status = req.query.status;

      const filteredRows = rows.filter(
        (row) =>
          row.progress.status === status
      );

      rows.splice(
        0,
        rows.length,
        ...filteredRows
      );
    }

    res.json(rows);
  } catch (error) {
    console.error(
      "Problems fetch error:",
      error
    );

    res.status(500).json({
      error: "Unable to fetch problems",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/problems/with-progress
|--------------------------------------------------------------------------
*/
router.get(
  "/with-progress",
  async (req, res) => {
    try {
      const sheet = getSheet(req);
      const category =
        req.query.category || "";

      const difficulty =
        getDifficulty(req);

      const search =
        req.query.search || "";

      const filter = buildSearchQuery(
        sheet,
        category,
        search,
        difficulty
      );

      const problems =
        await Problem.find(filter).lean();

      const progressMap =
        await getProgressMap(req.user._id);

      const rows = [];

      for (const problem of problems) {
        const placements =
          getPlacements(
            problem,
            sheet,
            category
          );

        for (const placement of placements) {
          rows.push(
            present(
              problem,
              placement,
              progressMap.get(
                problem._id.toString()
              )
            )
          );
        }
      }

      rows.sort(
        (a, b) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      );

      res.json(rows);
    } catch (error) {
      console.error(
        "Problems with progress error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to fetch problems",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/problems/categories
|--------------------------------------------------------------------------
*/
router.get(
  "/categories",
  async (req, res) => {
    try {
      const sheet = getSheet(req);

      const problems =
        await Problem.find({
          placements: {
            $elemMatch: {
              sheet,
            },
          },
        })
          .select("placements")
          .lean();

      const map = new Map();

      for (const problem of problems) {
        for (const placement of
          problem.placements || []) {
          if (
            placement.sheet !== sheet
          ) {
            continue;
          }

          if (
            !map.has(
              placement.category
            )
          ) {
            map.set(
              placement.category,
              {
                name: placement.category,
                count: 0,
                firstOrder:
                  placement.order,
              }
            );
          }

          const item = map.get(
            placement.category
          );

          item.count += 1;

          item.firstOrder =
            Math.min(
              item.firstOrder,
              placement.order
            );
        }
      }

      const categories = [
        ...map.values(),
      ].sort(
        (a, b) =>
          a.firstOrder -
          b.firstOrder
      );

      res.json(categories);
    } catch (error) {
      console.error(
        "Categories fetch error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to fetch categories",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/problems/patterns
|--------------------------------------------------------------------------
*/
router.get(
  "/patterns",
  async (req, res) => {
    try {
      const sheet = getSheet(req);
      const category =
        req.query.category || "";

      const problems =
        await Problem.find({
          placements: {
            $elemMatch:
              buildPlacementMatch(
                sheet,
                category
              ),
          },
        })
          .select("placements")
          .lean();

      const patterns = new Set();

      for (const problem of problems) {
        for (const placement of
          problem.placements || []) {
          if (
            placement.sheet === sheet &&
            (!category ||
              placement.category ===
                category)
          ) {
            patterns.add(
              placement.pattern
            );
          }
        }
      }

      res.json([
        ...patterns,
      ]);
    } catch (error) {
      console.error(
        "Patterns fetch error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to fetch patterns",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/problems/:slug
|--------------------------------------------------------------------------
*/
router.get(
  "/:slug",
  async (req, res) => {
    try {
      const problem =
        await Problem.findOne({
          slug: req.params.slug,
        }).lean();

      if (!problem) {
        return res.status(404).json({
          error: "Problem not found",
        });
      }

      const sheet = getSheet(req);

      const placement =
        getPlacements(
          problem,
          sheet
        )[0];

      if (!placement) {
        return res.status(404).json({
          error:
            "Problem is not part of this sheet",
        });
      }

      const progress =
        await Progress.findOne({
          userId: req.user._id,
          problemId: problem._id,
        }).lean();

      res.json(
        present(
          problem,
          placement,
          progress
        )
      );
    } catch (error) {
      console.error(
        "Single problem fetch error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to fetch problem",
      });
    }
  }
);

module.exports = router;