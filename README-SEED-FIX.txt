DSA Hunt - Sheet Data Fix
==========================

This build fixes the sheet data model so one canonical LeetCode problem can
appear in multiple categories/sheets without duplicate-key seed failures.

The supplied lists are preserved as placements:
- NeetCode 150: 150 placements
- Blind 75: 75 placements
- NeetCode 250: 202 supplied placements (the supplied source contains 202 entries,
  not 250; no missing problems were invented)

A problem can have multiple placements in the same sheet when the supplied
source places it under multiple categories. Progress remains attached to the
canonical problem, so solving one occurrence updates the same problem everywhere.

Startup:
1. Keep your existing backend/.env.
2. Run START-DSA-HUNT.bat.
3. The seed migrates legacy duplicate problem records and rebuilds the relevant
   Problem indexes before loading the supplied sheet placements.

Do not delete the MongoDB database to fix duplicate-key errors. This build
handles the legacy duplicates during seeding.
