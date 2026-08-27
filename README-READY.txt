DSA HUNT — PRODUCTION BUILD

Included source sheets:
- NeetCode 150: 150 entries from the supplied source
- Blind 75: 75 entries from the supplied source
- NeetCode 250: 202 entries from the supplied source file. The supplied file contains 202 bullet entries; this build does not invent the missing 48.

Sheet behavior:
- Three sheets in the global selector
- Global sidebar changes categories according to the selected sheet
- No sub-pattern hierarchy
- Sheet-specific category mappings are stored separately, so the same problem can belong to different categories on different sheets
- Search supports title, category/pattern and sheet problem number
- Original supplied order is preserved

Auth/profile:
- Gmail-only email/password auth
- GitHub OAuth
- Google OAuth wiring ready for credentials
- HttpOnly session cookies
- Production-style profile page and editable display name

IMPORTANT: Keep your existing working backend/.env. Do not commit secrets.
