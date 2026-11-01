# Phases

Build order, status and commit messages. Status values: **Done** (tested by the developer), **In test**, **Planned**.

Commit messages follow `rule.md` section 8. They are suggestions that match the work done.

## Phase 0: Planning and pivot

**Status: Done**

- Interview prep with the 100 MERN questions PDF.
- Decided the product, stack (MERN, JavaScript only), GSAP, browser voice, server-checked timer, no user code run on the server.
- Built a UI mockup (Login, Register, Dashboard, Room, History, Mobile, Design System, Animation Map).
- Wrote the first docs and a Word plan.
- Removed the AI API after a billing failure and a bad-file mix-up. Moved to local bank, generators and keyword grading.

`docs: add first planning docs`

## Phase 1: Foundation and authentication

**Status: Done**

| Step | Work |
|---|---|
| Part 1 | Server setup: `server.js`, `app.js`, env check, DB, error handler, `ApiError`, `asyncHandler` |
| Part 2 | Register, login, logout, me. httpOnly JWT, bcrypt, single-device login with `confirmToken`, `SESSION_ENDED`, rate limit |
| Part 3 | `Interview` and `Attempt` models, one running interview per user, summary and refresh logic |
| Client 14 to 16 | Vite, Tailwind, router skeleton. Redux auth, Login, Register, `ProtectedRoute`, session-ended handling |

```
chore(server): set up express app, env check and error handler
feat(auth): add register, login and single-device sessions
feat(interview): add Interview and Attempt models
feat(client): add router skeleton, auth slice, login and register
```

## Phase 2: Interview engine and question bank

**Status: Done**

| Step | Work |
|---|---|
| Backend 2 to 13 | Validators, round builder, planner, flow service, grading, round submit and final finish, review, banks (JavaScript, React, HTML/CSS, Node, Express, MongoDB, DSA, HR), aptitude and reasoning generators |
| Client 17 to 20 | Dashboard round selection and Start, interview room (sidebar, question, MCQ and theory submit), round timer and final submit, hint and review page |
| Voice | `useSpeech`, "Read again", auto-read on question change |

```
feat(questions): add local banks and generators
feat(grading): add keyword rubric grading
feat(interview): add round timer, hint and review
feat(room): add voice reading of questions
```

## Phase 3: History, retention and anti-cheat

**Status: Done**

| Step | Work |
|---|---|
| 21 | History page, continue-interview banner |
| 22 | Server: search, delete, delete all, retention |
| 23 | History UI: search with 400 ms debounce, delete row, delete all, retention dropdown |
| 24 | Anti-cheat: away warning and cheat, server-side refresh count with a one-time 1 mark penalty, `RoomBanner`, penalty note on `ScoreCard` |
| Fix | `hintUsed` was missing from the `Attempt` schema, so hint penalty never applied and the hint vanished on reload |

```
feat(history): add search, delete and retention
feat(anti-cheat): add away timer and refresh penalty
fix(attempt): add hintUsed to schema
```

## Phase 4: Mini Project round

**Status: Done**

| Step | Work |
|---|---|
| Server | `miniProject/` module, hooks into planner, constants, `Attempt`, score, history, validators, `app.js` |
| 2a | Dashboard card and `StackPicker` |
| 2b | `fileTree.js`, slice, autosave, store registration |
| 2c | `FileTree`, Monaco editor, `RequirementsList`, `MiniProjectRoom`, `flushProject` |
| 3a | Sandboxed preview, console, focus polling for anti-cheat |
| 3b | Code review view, "Not graded" |
| Fix | Sidebar tick without refresh. Save and Submit Round in the Task aside |

```
feat(mini-project): add server module and project bank
feat(mini-project): add editor room with Monaco and autosave
feat(mini-project): add sandboxed preview and review
fix(mini-project): tick question after autosave
```

## Phase 5: Custom questions, PDF import and roles

**Status: Done**

| Step | Work |
|---|---|
| Cleanup | Custom formats limited to mcq, practical, descriptive. Project hidden from "mistakes" filter. Removed unused limiter and AI env lines |
| My Questions A and B | List, delete, add form |
| Import C1 to C3 | PDF text, parser, review screen |
| S1 | `role`, `adminOnly`, difficulty and source, shared questions, `/counts`, planner by difficulty, limit 200 |
| S2a and S2b | Difficulty in form, tags, filter tabs. Level detection and per-question difficulty in import |

```
feat(my-questions): add list, add form and delete
feat(import): add browser PDF import with review
feat(roles): add admin role, difficulty and shared questions
```

## Phase 6: Dashboards and admin

**Status: Done**

| Step | Work |
|---|---|
| S3 | Role-aware layout: `AppShell`, `UserNav`, `AdminNav`, `AdminRoute`, `selectionSlice` |
| S4a and S4b | `/api/stats/me`, dashboard cards, trend, round bars, recent list |
| S5a and S5b | `/api/stats/admin`, Overview screen |
| S9 | Leaderboard: aggregation, podium, table, route and link |

```
feat(layout): add role-aware shell and navigation
feat(stats): add user stats api and dashboard
feat(admin): add overview and stats api
feat(admin): add leaderboard
```

## Phase 7: Design system and motion

**Status: Done** (light theme not started)

| Step | Work |
|---|---|
| S6a and S6b | Radius, hover and press, glow. `ConfirmModal`, toasts, banner slide-in |
| R1 to R6 | Glass tokens and classes. Sidebar, cards, auth, History, My Questions as glass. Interview room and Mini Project panels solid |
| T1 to T6 | Modern Minimal and Lime Frost themes, `DotGrid`, bento dashboard (treemap, radar), top performers, `DotLoader`, 404, `ProductTour`, `ProximityText` |
| D2 to D5 | Page fade and slide, card slide, stagger, circle wipe, bar fill, cheating pulse and shake, timer pulse, import stepper, tick pop |
| S8 | Mobile drawer, sticky timer strip, "Not graded" in History row, mobile Review |
| Cleanup | Removed `ConstellationGrid`, lint fixed (6 errors), build clean |

```
style(ui): add glass tokens and role themes
feat(ui): add dot grid, loader, 404 and product tour
feat(motion): add page, card and list animations
feat(mobile): add drawer and sticky timer
```

## Phase 8: Forgot password and profile

**Status: Step 4 in test**

| Step | Work | Status |
|---|---|---|
| 1 | Server: forgot-password, verify-otp, reset-password, `passwordReset` field, `passwordResetService` | Done |
| 2 | Client: `ForgotPassword` page, `OtpModal`, glow, Login link | Done |
| 3 | Server: `PATCH /auth/profile`, `PATCH /auth/password` | Done |
| 4 | Client: `ProfileModal`, avatar button in `AppShell` (sidebar and mobile top bar) | In test |

```
feat(auth): add forgot password and otp verification
feat(auth): add forgot password page and otp modal
feat(auth): add profile and password update endpoints
feat(profile): add profile modal
```

## Phase 9: Testing and QA

**Status: In progress**

- Regression checklist: 42 lines, sections A to J. A full run is pending.
- After Phase 8, rerun A (new user), B (login and session) and G (admin).
- Step 4 test: `npm run lint`, `npm run build`, then 10 manual steps.
- Mobile checks still open for History, My Questions, Dashboard, Leaderboard.
- Theory layout polish: needs a note on what feels wrong.

## Phase 10: Deployment and maintenance

**Status: Planned**

Before deploy:
- [ ] Remove the OTP from the API response (or add real email).
- [ ] `NODE_ENV=production`, HTTPS, cookie `sameSite: "none"`.
- [ ] CSRF protection, or one parent domain for client and API.
- [ ] Update `docs/memory.md` and README with the final endpoints.
- [ ] Decide host (client, API, MongoDB Atlas).
- [ ] Replace the default Vite favicon.
- [ ] Check Monaco CDN access from the deploy network.

After deploy:
- Scheduled auto-delete sweep.
- Server-side anti-cheat heartbeat.
- Bulk-save endpoint for PDF import.
- Light theme, HR round, theory PDF parser, profile pictures.
- Keep an eye on admin stats cost as data grows (move to aggregation).