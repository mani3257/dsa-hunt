DSA HUNT - PROFILE + AUTH UPDATE

This package adds:
- Clickable account/profile control in the global navbar.
- Protected /profile page.
- Profile details: name, email, provider, member since.
- Editable display name.
- GitHub / Google / Email provider badges.
- Session security information and sign-out action.
- GitHub OAuth button styling fixed with a self-contained SVG icon.
- Gmail validation for email/password authentication remains enforced.
- OAuth accounts do not require passwordHash/passwordSalt.

IMPORTANT:
Use your CURRENT working backend/.env because it contains your private MongoDB and GitHub OAuth credentials.
The distributed backend/.env in this package intentionally has blank secrets.
Do not commit .env to GitHub.

After replacing/updating files:
1. Start backend: cd backend && npm run dev
2. Start frontend: cd frontend && npm run dev
3. Open http://localhost:5173
4. Click your account name/avatar in the navbar -> Profile.
