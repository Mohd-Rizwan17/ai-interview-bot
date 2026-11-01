# Architecture

How the AI Interview Bot is built. Read `prd.md` first for what it does.

## 1. Overview

```
Browser (React + Vite)
   │  axios, httpOnly cookie
   ▼
Express 5 API  ──►  MongoDB (Mongoose 9)
   │
   ├─ local question bank (JS data files)
   └─ generators (aptitude, reasoning)
```

- One repo, two apps: `client/` and `server/`.
- No AI service, no mail service, no file storage. PDFs are read in the browser.
- The server owns time, scores, correct answers and session state. The client only displays.

## 2. Repo layout

```
ai-interview-bot/
├── client/
├── server/
├── docs/
├── .gitignore
└── README.md
```

Keep the repo out of OneDrive. `.git` and `node_modules` cause sync problems there.

## 3. Server

Pattern: **routes → validators → controllers → services → models**. Controllers stay thin and call a service. Business rules live in services.

```
server/
├── src/
│   ├── server.js                 connect DB first, then listen
│   ├── app.js                    helmet, cors, json 1mb, cookie-parser, routes, 404, error handler
│   ├── config/
│   │   ├── env.js                required variables, fails at start-up
│   │   └── db.js
│   ├── constants/
│   │   ├── interview.js          formats, statuses, time limits, refresh penalty
│   │   └── rounds.js             list of tests, "all" = 5 rounds
│   ├── models/
│   │   ├── User.js
│   │   ├── Interview.js
│   │   ├── Attempt.js
│   │   └── CustomQuestion.js
│   ├── controllers/              auth, interview, customQuestion, stats
│   ├── routes/                   authRoutes, interviewRoutes, customQuestionRoutes, statsRoutes
│   ├── validators/               authValidators, interviewValidators, customQuestionValidators, validate.js
│   ├── middlewares/
│   │   ├── auth.js               protect, adminOnly
│   │   ├── rateLimit.js          authLimiter
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── sessionService.js
│   │   ├── passwordResetService.js
│   │   ├── interviewService.js
│   │   ├── interviewFlowService.js
│   │   ├── questionService.js
│   │   ├── questionPlannerService.js
│   │   ├── gradingService.js
│   │   ├── scoreService.js
│   │   ├── historyService.js
│   │   └── statsService.js
│   ├── data/                     technicalQuestions (60), dsaQuestions (13), hrQuestions (6), reasoningQuestions (9)
│   ├── generators/               aptitudeGenerator, reasoningGenerator, helpers
│   ├── miniProject/              self-contained feature module (section 3.5)
│   └── utils/                    ApiError, asyncHandler, deviceInfo
└── tests/                        bank.test.mjs and other pure-function tests
```

Folder names above follow the build history. If the real tree differs in small ways, trust the tree and fix this file.

### 3.1 Error handling

- `ApiError` carries a status and a message. `asyncHandler` wraps controllers, so there is no `try/catch` in them.
- `errorHandler` returns one shape for everything: `{ success: false, message }`. It maps Mongoose validation errors, bad ids, duplicate keys (409) and bad JSON.
- Express 5 leaves `req.body` undefined on a POST without a body. `app.js` sets `req.body ??= {}`.

### 3.2 Auth and sessions

- Password: bcrypt, cost 12, stored as `passwordHash` (`select: false`). `toJSON` removes secrets, including `passwordReset`.
- Login returns the same message for a wrong email or a wrong password.
- JWT carries a `sessionId`. `User.activeSession` stores the current one, with device name ("Desktop · Chrome").
- `protect` loads the user and compares `sessionId`. A mismatch returns `SESSION_ENDED`.
- Second-device login: server returns 409 and a `confirmToken` (JWT, 5 minutes). `POST /login/confirm` swaps the session. Nothing sensitive stays on the client.
- `isCurrentDevice` stops a user from conflicting with their own device after register.
- Cookie options: `httpOnly`, and in production `secure` with `sameSite: "none"`.
- Validators use `isString` on inputs, which blocks NoSQL operator injection.
- `authLimiter`: 30 attempts per 15 minutes on login, and also on the OTP routes and password change.

### 3.3 Forgot password

Service: `passwordResetService.js`.

| Function | Job |
|---|---|
| `issueOtp` | `crypto.randomInt` 6 digits, SHA-256 hash, saved in `User.passwordReset { otpHash, expiresAt, attempts, verified }`. Overwrites the old one, so a resend kills the previous OTP |
| `verifyOtp` | Checks expiry and the 5-try limit, then returns a `resetToken` (JWT, 10 minutes) and sets `verified` |
| `getVerifiedResetUser` | At reset time, checks both the token and the DB flag |

Why these choices:
- `randomInt`, not `Math.random`, because it is secure.
- SHA-256, not bcrypt. A 6-digit space is 1 million values, so a slow hash adds nothing. The real protection is the 5-try limit and the short expiry.
- `resetToken` is a JWT, the same pattern as `confirmToken`.
- After a reset, `passwordReset` is removed, `activeSession` is cleared, a running interview is closed and the cookie is cleared.
- The OTP is returned in the response (practice flow). See `prd.md` section 6.

Codes: `EMAIL_NOT_FOUND` (404), `OTP_EXPIRED`, `OTP_BLOCKED`, `WRONG_PASSWORD` (400, not 401, so a client interceptor never logs the user out for a mistyped password).

### 3.4 Interview engine

**Models**
- `Interview`: user, title, rounds, status, marks, `refreshCount`, `penaltyMarks`. A partial unique index allows only one `in_progress` interview per user.
- `Attempt`: one per question. Holds a snapshot of the question, the user's answer, `hintUsed`, `project { id, stack }`. The correct answer and rubric are `select: false`, so they do not leak during an interview.
- `CustomQuestion`: format (`mcq`, `practical`, `descriptive`), `difficulty`, `source` (PDF name or manual), keywords. Shared by all users, admin-only write.

**Flow**
1. Start: `questionPlannerService` picks questions for every round once. Mini Project uses `projectTimeSec`. Round time is `projectTimeSec ?? TIME_LIMIT_BY_FORMAT[format]`.
2. The user submits each question. `gradingService` grades it (MCQ exact, theory by keyword rubric).
3. Round submit and Final Submit use `endInterview`, which is atomic.
4. `refreshProgress` recomputes `obtainedMarks` from the attempts, then subtracts `penaltyMarks`. Penalty is its own field, because a direct subtraction would be overwritten at the next recalculation.
5. `buildSummary` returns the numbers the client shows.
6. Server checks the timer on every write. An expired round cannot be answered.

**Anti-cheat**
- Away time is measured on the client, but the cheat is reported through the server, so the interview ends even if the tab is hidden.
- `recordRefresh` does an atomic `$inc` on `refreshCount`. The penalty is applied once, when the count first passes `REFRESH_FREE_COUNT`. Constants: `REFRESH_FREE_COUNT`, `REFRESH_PENALTY`.
- The count is on the server because browser storage can be cleared.
- Tab close cannot be told apart from refresh (both fire `pagehide`), so closing a tab is not treated as cheating by itself.

**History**
- `historyService`: search, pagination (3 per page), delete one, delete all, retention. Deleting an interview also deletes its `ProjectWork` documents.
- Retention is set with `PATCH /retention`. Postman body must be raw JSON, or `req.body.days` is undefined and the validator returns 400.

**Stats**
- `buildStats` and `buildAdminStats` are pure functions, so they can be tested on sample data. Only completed interviews with `totalMarks > 0` count. An incomplete interview shows `null`, not 0.
- Round percentage is total marks over total marks, not an average of percentages, so small rounds do not skew it.
- `getLeaderboard` is one aggregation: completed, `totalMarks > 0`, average per user, joined to `User`, role `user` only. Same filter as `/stats/me`, so the two never disagree.

### 3.5 Mini Project module

Built as a folder that can be removed or replaced. Few lines touch the rest of the code.

```
server/src/miniProject/
├── constants.js         file, folder, depth and size limits
├── projectBank.js       5 projects + starter files per stack (data only)
├── ProjectWork.js       model: user's files + project snapshot
├── projectValidators.js path traversal ("../"), duplicate paths, 200 KB limit
├── projectService.js    ownership, first-load file creation, save
├── projectController.js
└── projectRoutes.js     GET /stacks, GET /:attemptId, PUT /:attemptId/files
```

- Code is stored in its own collection, not inside `Attempt`, so `Attempt` stays small and deletion is simple.
- `ProjectWork` keeps a snapshot of the project, so editing the bank later does not break old reviews.
- Ownership: attempt → interview → user.
- First load creates the starter files. A race on that is handled through duplicate key (E11000).
- A save that differs from the starter marks the attempt `answered` and returns `answered` in the response. The client slice listens to it to tick the sidebar.
- The project round reuses the timer, round submit, expiry and history code unchanged. That reuse was the point of the design.

**Touch points in existing code:** `constants/interview.js` (round, `project` format, marks 0, not in `ALL_ROUNDS`), `Attempt.js`, `questionPlannerService.js`, `interviewService.js` (`buildRounds`), `scoreService.js` (ungraded early return), `historyService.js`, `interviewValidators.js` (`projectStack`), `interviewController.js`, `app.js` (`/api/mini-projects`).

### 3.6 API summary

Methods are listed where they are known. For the rest, open the route file.

| Group | Route | Access | Purpose |
|---|---|---|---|
| Auth | `POST /api/auth/register` | public | Create account |
| Auth | `POST /api/auth/login` | public | Login, or 409 with `confirmToken` |
| Auth | `POST /api/auth/login/confirm` | public | Take over the session |
| Auth | `POST /api/auth/logout`, `GET /api/auth/me` | user | Logout, current user |
| Auth | `POST /api/auth/forgot-password`, `/verify-otp`, `/reset-password` | public | Reset flow |
| Auth | `PATCH /api/auth/profile` | user | Change name |
| Auth | `PATCH /api/auth/password` | user | Change password (current password needed) |
| Interviews | create, history, report, cheat, finish, round fetch, answer, hint | user | Interview flow (see `interviewRoutes.js`) |
| Interviews | `POST /:id/refresh` | user | Record a refresh |
| Interviews | `PATCH /retention` | user | Auto-delete days |
| Interviews | delete one, delete all | user | History cleanup |
| Custom questions | add, list, delete | admin | Question bank |
| Custom questions | `GET /counts` | user | Count per difficulty for the sidebar |
| Mini projects | `GET /api/mini-projects/stacks`, `GET /:attemptId`, `PUT /:attemptId/files` | user | Editor data |
| Stats | `GET /api/stats/me` | user | Dashboard numbers |
| Stats | `GET /api/stats/admin` | admin | Overview numbers |
| Stats | `GET /api/stats/leaderboard` | admin | Ranking |

Admin routes use `protect` then `adminOnly` (403 for others).

## 4. Client

```
client/src/
├── api/                  axios instance and per-area calls
├── store/                Redux Toolkit
│   ├── index.js          one root reducer, resets on logout
│   ├── authSlice.js
│   ├── interviewSlice.js
│   ├── historySlice.js
│   ├── selectionSlice.js     rounds, difficulty, projectStack
│   ├── customQuestionSlice.js
│   ├── statsSlice.js
│   ├── adminStatsSlice.js    overview data and leaderboard
│   └── toastSlice.js
├── routes/               AppRoutes, ProtectedRoute, AdminRoute
├── layouts/              MainLayout, AppShell, AuthLayout
├── pages/                Login, Register, ForgotPassword, Home, Dashboard, AdminOverview,
│                         Leaderboard, History, MyQuestions, ImportPdf, InterviewRoom, Review, NotFound
├── components/           StatCard, TrendChart, RoundTreemap, RoundRadar, RoundBars, RecentList,
│                         NavItem, UserNav, AdminNav, Avatar, ProfileModal, OtpModal, ConfirmModal,
│                         ToastHost, RoomBanner, Timer, SidePanel, QuestionPanel, McqOptions, HintBox,
│                         ScoreCard, HistoryRow, ProductTour, DotGrid, DotLoader, PageLoader,
│                         ProximityText, PdfImport, ImportReview, ImportSteps ...
├── features/miniProject/ self-contained client module (section 4.4)
├── hooks/                useAntiCheat, useSpeech, useCardSlide, useAutosave (inside the module)
├── constants/            rounds
└── utils/                pdfText, parseQuestions, circleWipe, tourStorage
```

### 4.1 Routing

`AppRoutes` uses `createBrowserRouter` and `RouterProvider`.

- Public, inside `AuthLayout`: `/login`, `/register`, `/forgot-password`.
- `MainLayout` wraps `/` and sets `<html data-role>`. Inside it: `ProtectedRoute`, then `AppShell` (sidebar and `Outlet`) for Home, History, admin pages. Interview room and Review sit outside the shell, full screen.
- `Home` at `/` shows Dashboard for a user and Overview for an admin.
- `AdminRoute` redirects a non-admin to `/`. Admin pages: Overview, My Questions, PDF import, `/leaderboard`.
- A catch-all `*` goes to `NotFound`.

### 4.2 State

- Redux Toolkit with `createAsyncThunk` and `rejectWithValue` everywhere.
- Forgot-password and profile thunks are **not** in the shared loading/error matchers. Otherwise the Login page would show their loading and errors. Those pages keep local state and use `.unwrap()`.
- `selectionSlice` holds the round choice, so the sidebar and the Start card read the same data. Logout resets it through the root reducer.
- `toastSlice` listens to other slices' `fulfilled` actions, so no component dispatches a toast.
- `updateProfile.fulfilled` updates `state.user`, so the sidebar name changes at once, with no extra request.
- Errors stay inline on the page. Only success shows a toast.

### 4.3 Key behaviours

- **Anti-cheat hook** polls once a second with `document.hidden || !document.hasFocus()`. Focus and blur events were dropped: a click inside the preview iframe fires `blur` on the parent, and alt-tab with focus inside the iframe sends the parent nothing. `hasFocus()` stays true while the iframe is focused.
- **Refresh detection** (`isReloadOfThisPage`) checks the navigation type, the URL and a one-time module flag. Without the guard, a refresh on the Dashboard followed by Continue would count a false refresh.
- **Voice:** `useSpeech` wraps `speechSynthesis`. It tracks the current utterance, so an old `onend` cannot stop a new one. Chrome blocks auto-speak without a user click, so after a refresh only "Read again" works.
- **Dialogs** are native `<dialog>`. `OtpModal` uses `key={expiresAt}` so a resend remounts it and resets the countdown without `setState` in an effect.
- **Loader** shows only after 400 ms of waiting.
- **Charts** are hand-made SVG and CSS. No chart library.

### 4.4 Mini Project client module

```
client/src/features/miniProject/
├── api.js
├── slice (miniProjectSlice.js)   files, folders, tabs, editVersion, saveStatus
├── fileTree.js                   pure add / rename / delete / buildTree / parentPath / baseName
├── useAutosave.js                1.5 s debounce
├── previewDocument.js            inlines local css/js into index.html, console bridge, localStorage shim
└── components/
    ├── StackPicker.jsx
    ├── FileTree.jsx
    ├── CodeEditor.jsx            Monaco
    ├── RequirementsList.jsx
    ├── PreviewFrame.jsx          sandboxed iframe, Run, console
    ├── ProjectAside.jsx          Task and Preview tabs, both kept mounted
    ├── ProjectActions.jsx        Save and Submit Round
    ├── MiniProjectRoom.jsx
    └── ProjectReview.jsx
```

- `fileTree.js` is pure functions, so a Node script (`check-tree.mjs`) can test it. Limits mirror the server and must stay in sync.
- State is a flat `files[]` and `folders[]`. Easier to validate, serialise and rename (change a prefix) than a nested tree.
- `saveProject` has a `condition`: no new save starts while one is running. This stops an old request from overwriting newer code.
- `flushProject` forces a save before Submit. If it fails, Submit is blocked.
- **Preview sandbox:** no `allow-same-origin`, so user code cannot reach our cookies or API. It runs only on Run, because an iframe usually shares the parent's process and an infinite loop would freeze the tab. Run saves first.
- `interviewSlice` listens to `saveProject.fulfilled` and marks the question answered. This is a small coupling to a feature module, chosen to keep edits low.

### 4.5 PDF import

- `pdfjs-dist` is lazy-loaded with `import()`.
- `pdfText.js`: 10 MB and 150 page limits, password-protected PDF message, "No text found" for scans, guard for items without `str`.
- `parseQuestions.js` splits questions, answer key and hints, strips page headers and footers (`stripPageNoise`), checks option order A to D, accepts only rising question numbers, flags key vs hint conflicts, and detects difficulty from the start of the PDF ("Beginner Level" means Easy). Words inside questions are ignored for this.
- `ImportReview.jsx`: checkbox, edit, issues, duplicate check ("Already in My Questions"), remaining slots. Saving is one POST per question and reports how many saved if one fails.

## 5. Data flow example

Starting and finishing a round:

1. Dashboard reads `selectionSlice` and sends rounds, difficulty and `projectStack` to the create-interview route.
2. Server closes any running interview, plans all questions and creates `Interview` and `Attempt` documents.
3. `InterviewRoom` fetches the round (no correct answers) and starts the timer from the server deadline.
4. Each Submit goes to the server, which grades it and returns the new state.
5. Round Submit or timer expiry ends the round. Final Submit ends the interview and runs `refreshProgress`.
6. `Review` fetches the report, which now includes correct answers and explanations.
7. `/stats/me` picks the interview up on the next dashboard load.

## 6. Decisions and alternatives

| Choice | Instead of | Why |
|---|---|---|
| Local bank, generators, keyword grading | AI API | No cost, no billing failures. Generated answers are exact (40,500 items checked against a separate formula) |
| JavaScript only | TypeScript | Less setup for this stack |
| Server-checked timer | Client timer | A client timer can be bypassed |
| Cookie JWT, one session in DB | Access + refresh tokens, express-session, Redis | Simple, enough for this size |
| `confirmToken` for second device | "Clear cookies" | Clearing the phone cookie does not end the desktop session |
| `User.passwordReset` field | Separate model with TTL index | One less collection. Expiry is checked in code anyway |
| Pure `buildStats` | Aggregation for user stats | Testable on sample data. Data is small because of retention |
| Aggregation for the leaderboard | In-memory ranking | Database does the work |
| Average % for ranking | Total marks | Total marks always favours whoever took more interviews |
| Redux for selection | Context or URL params | Logout reset comes free |
| Hand-made SVG charts | Recharts, Chart.js | Eight-point line chart does not need a library |
| Native `<dialog>`, own toast | Radix, Headless UI, sonner | No new library. Radix would have slightly better accessibility |
| 2D canvas dot grid | three.js, tsparticles | Same look, offline-safe, honours reduced motion |
| GSAP | framer-motion | GSAP is already in the project |
| Separate `ProjectWork` collection | Code inside `Attempt` | Keeps `Attempt` small and deletion simple |
| Monaco | CodeMirror, textarea | VS Code feel was a requirement |
| Sandboxed iframe, Run only | Sandpack, WebContainers, blob URLs | Light, no CDN dependency for the preview itself |
| PDF parsed in browser | `multer` + `pdf-parse` | No upload or storage on the server |
| Ungraded Mini Project | AI or fixed tests | Free-form HTML cannot be tested reliably |
| `localStorage` for tour flag | A field on `User` | Avoids changing model and API |

## 7. Ideas not built

Server-side anti-cheat heartbeat, bulk-save endpoint for imports, shared `Button` component (30+ files would change), light theme, profile pictures, email OTP, lifetime stats that survive deletes.