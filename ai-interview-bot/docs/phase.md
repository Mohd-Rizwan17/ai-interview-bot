# Phases

Status: done / in progress / pending

## Phase 1: Login and auth (done)
Register, login, logout, JWT cookie, single-device login with confirm, `SESSION_ENDED`, roles (user, admin), `protect`, `adminOnly`.

## Phase 2: Dashboard (done)
- Interview flow: rounds, timer, hint, voice, anti-cheat, refresh penalty, review.
- User stats API and Dashboard. Admin stats API and Overview.
- Leaderboard (podium, table).
- Bento dashboard: score trend, round treemap, round radar, recent interviews.

## Phase 3: CRUD (done)
- Custom questions: add, list, delete (max 200), counts per difficulty.
- PDF import: parse in the browser, review, edit, save.
- History: search, pagination, delete, delete all, retention (3 to 30 days).

## Phase 4: Additional features (done)
- Mini Project round (Monaco, file tree, preview, autosave).
- Redesign: Modern Minimal (user) and Lime Frost (admin) themes, glass surfaces, dot-grid auth background, floating sidebar, mobile drawer, dot loader, 404, product tour, proximity heading.
- Animations: page enter, auth card slide, login circle wipe, list stagger, bar fill, cheating alert, timer pulse, tick pop, import stepper.

## Phase 5: Testing and QA (in progress)
- Build and lint are clean.
- Mobile check done for the interview room and Review.
- Pending: theory layout polish, a full manual regression (new user, interview, review, admin, mini project), Postman checks for admin-only routes.

## Phase 6: Deployment and maintenance (pending)
- Cookie `sameSite: "none"` and CSRF check, env docs, README.
- Pick a host for the client, server and MongoDB.
- Later: scheduled auto-delete sweep, "never delete" retention, theory PDF parser, HR round, light theme, profile pictures.