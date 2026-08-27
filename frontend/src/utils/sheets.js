export const SHEETS = [
  {
    value: "neetcode150",
    label: "NeetCode 150",
    description: "The essential 150 patterns for interview prep.",
  },
  {
    value: "blind75",
    label: "Blind 75",
    description: "The classic 75-problem interview shortlist.",
  },
  {
    value: "neetcode250",
    label: "NeetCode 250",
    description: "The extended set for deeper pattern coverage.",
  },
  {
    value: "striverA2Z",
    label: "Striver A2Z",
    description: "Basics to advanced — a complete DSA roadmap.",
  },
  {
    value: "striver79",
    label: "Striver SDE 79",
    description: "The 79-problem interview shortlist.",
  },
];

// Sheets that are planned but don't have verified problem data yet.
export const PENDING_SHEETS = [];

export const SHEET_LABELS = Object.fromEntries(SHEETS.map((s) => [s.value, s.label]));
