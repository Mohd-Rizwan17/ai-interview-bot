# PRD: AI Interview Bot

Product requirements for the AI Interview Bot. This file says what we are building, for whom, and what is still missing. How it is built lives in `architecture.md`.

## 1. Purpose

MERN freshers lose interviews on two things: they have never practised under a timer, and they do not know what they missed after a mock test. This app gives them a timed practice interview with a graded review at the end.

The name is a leftover. There is **no AI call at runtime**. The AI API was removed on purpose (cost, billing failures, and unreliable grading). Questions come from a local bank, formula generators and admin-written custom questions. Theory answers are graded with a keyword rubric.

## 2. Users

| User | What they do |
|---|---|
| **User** (a fresher) | Registers, picks rounds and a difficulty, takes a timed interview, reads the review, tracks progress on a dashboard |
| **Admin** | Builds the question bank (add question, import from PDF), watches how all users perform, sees the leaderboard |

There is no admin sign-up. An admin is a normal account whose `role` is changed to `"admin"` in MongoDB Compass.

## 3. Goals and non-goals

**Goals**
- Feel like a real interview: rounds, a timer, one device at a time, anti-cheat.
- Tell the user exactly what they missed, not just a score.
- Let an admin grow the question bank without touching code.
- Run on free tools only: no paid API, no email service, no cloud storage.

**Non-goals**
- Running user code on the server (security risk).
- AI-generated questions or AI grading (may return later as a separate service file).
- Webcam or screen-share proctoring (too heavy for this project).
- Real user data in production. See the OTP note in section 6.

## 4. Functional requirements

### 4.1 Auth and account
- Register and login. JWT in an httpOnly cookie, bcrypt password hash.
- **One device at a time.** Logging in on a second device returns 409 with a `confirmToken` (valid 5 minutes). Confirming logs the first device out with `SESSION_ENDED`.
- Logging in, logging out or starting a new interview closes a running interview as `incomplete`.
- **Forgot password:** email, then a 6-digit OTP shown in a popup, then a new password. OTP lasts 60 seconds, every resend makes a new one, and the Resend button glows when the OTP expires. Five wrong tries lock it.
- **Profile popup:** shows name, email, username, role, member since. The user can edit the name and change the password (current password required). Email is not editable.

### 4.2 Rounds and question bank
- Each selected test is its own round. The title is built from the selected names, for example "Frontend + Backend".
- Rounds: Aptitude, Reasoning, DSA, Frontend, Backend, My Questions, Mini Project. "Select all" means the five standard rounds (Aptitude, Reasoning, DSA, Frontend, Backend). It never includes My Questions or Mini Project.
- Sources: local data files (technical, DSA, HR, reasoning), generators (aptitude and reasoning, answers are exact), and admin custom questions.
- Question formats: MCQ, descriptive, practical. Mini Project is a separate `project` format.
- Same question never repeats inside one interview. All questions are planned once, at interview start.
- **My Questions round:** custom and imported questions only, picked randomly for the chosen difficulty (Easy, Medium, Hard). If a difficulty has no questions, Start is disabled with a warning. The server never fills from another difficulty.

### 4.3 Interview room
- Round timer. The server is the source of truth for time. The client timer is display only.
- Rounds are sequential. Round 1 is open, the rest are locked.
- The user can jump to any question inside the open round.
- Every question has only **Submit**. No instant right or wrong. The last round has **Final Submit**.
- Hint costs 1 mark.
- Browser voice reads the question aloud, with a "Read again" and "Stop" button.
- Theory answers are graded by keyword rubric: score is matched keywords divided by total keywords. Feedback shows "You covered" and "You missed".
- Sidebar shows Round N, the question list, tick state and progress. On a phone the timer sticks to the top.

### 4.4 Anti-cheat
- Away for less than the warning limit: nothing happens.
- Away for 30 seconds or more: a warning when the user returns.
- Away for the cheat limit (`CHEAT_AWAY_MS`, 60 seconds as last checked): the interview ends as cheating. The timer reports this itself, even if the user never comes back.
- Refresh: the first one is a warning only. From the second, 1 mark is cut once. It is not a cheat. A note shows under the result. The count is kept on the server.
- Cheating and refresh banners do not auto-hide.
- Not detectable from a browser: opening an AI tool or Google Lens on another device. We do not pretend to catch it.

### 4.5 Mini Project round
- User picks a stack (HTML/CSS/JS today) and gets a project: counter, stopwatch, todo, calculator or quiz.
- VS Code-like editor (Monaco): file tree, tabs, new file and folder, rename, delete, autosave every 1.5 seconds.
- Preview runs in a sandboxed iframe, only when the user presses Run, with a console panel.
- Not graded. `maxScore` is 0. The review shows the code and the requirements, and history shows "Not graded".
- Own time limit per project.

### 4.6 Review and history
- Review shows the user's choice, the correct answer, the explanation and the mistakes. "Show only mistakes" filter. Mini Project shows code, files and preview read-only.
- History lists interviews with a percentage, search, delete one, delete all (hidden while a search is active), and auto-delete (3, 5, 7, 10, 20 or 30 days, default 5). Page size is 3.
- A running interview cannot be deleted (409). An incomplete interview shows its percentage but cannot be opened (403).

### 4.7 User dashboard
- Four stat cards, score trend (last 8), round treemap, round radar, recent interviews with marks and "View review".
- Start card with the round picker. Product tour (4 steps, first visit only, replay with "Take a tour").

### 4.8 Admin
- **Overview:** four cards, how questions reach users (Easy, Medium, Hard counts), recent PDF imports, all-users round performance, "needs more questions", buttons for Import from PDF and Add question, top performers preview.
- **Leaderboard:** top 3 podium, rank 4 and below in a table. Ranked by average percentage over completed interviews with marks above zero. Ties go to the user with more interviews. Only role `user`.
- **My Questions:** add, list, filter by difficulty, delete. Questions are shared by all users. Bank limit is 200.
- **PDF import:** read in the browser, parsed into MCQ drafts, review and edit, duplicate check, bulk or per-question difficulty, save selected.

### 4.9 Look and feel
- Glass look. User theme Modern Minimal (neutral dark with blue). Admin theme Lime Frost.
- Smooth motion with reduced-motion support. Details in `design.md`.
- Mobile: sidebar becomes a drawer.

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Security | Hashed passwords and OTPs, httpOnly cookie, correct answers never sent during an interview (`select: false`), input validation on every write, rate limits on login and OTP routes, sandboxed preview without `allow-same-origin` |
| Reliability | Server stops at start-up if a required env variable is missing. One error shape: `{ success, message }` |
| Performance | Loader shows only after a request takes more than 400 ms. No blur animation. Stats are computed in pure functions, leaderboard in one aggregation |
| Compatibility | Latest Chrome first. Voice and preview depend on browser support |
| Accessibility | Native `<dialog>` for modals, Cancel focused first, reduced-motion respected |
| Cost | Zero running cost beyond hosting and MongoDB |

## 6. Known limits

Be honest about these before showing the project to anyone.

**Security and deploy**
- **The OTP is returned in the API response.** This is a practice flow, not real security. Do not deploy with real users. To switch to email, remove the `otp,` line from the controller response and send the code with nodemailer or similar. The rest of the flow stays.
- Forgot password returns 404 `EMAIL_NOT_FOUND`, so anyone can check if an email is registered. This is the price of showing the OTP in a popup.
- With `NODE_ENV=production` the cookie uses `sameSite: "none"`. If client and API are on different sites, add CSRF protection or use one parent domain.
- Anti-cheat only sees tab and window focus. A server-side heartbeat would also catch a user who closes the tab and returns.

**Grading**
- Keyword grading is approximate. A correct answer in different words can score low.
- Mini Project has no score.

**Mini Project**
- Preview does not support cross-file ES `import`.
- An infinite loop in user code can hang the tab.
- Monaco loads from a CDN, so the editor needs internet.
- Requirement ticks are on screen only and reset on refresh.
- Only HTML/CSS/JS. React needs a bundler (Sandpack or similar). Node and Express cannot run in a browser.

**Data and stats**
- Admin stats load interviews into memory. At larger scale they need aggregation.
- Auto-delete and Delete all also lower the user's stats, since stats are computed from stored interviews.
- Importing the same PDF name twice gives one row in "Recent imports".
- The tour "seen" flag lives in `localStorage`, per browser.
- Avatar "online" dot is decoration. The server has no online status.
- No profile pictures yet (storage not decided).

**Testing**
- Most code was written by reading, not by running. Passing results come from manual tests by the developer. Browser rendering, blur cost and mobile layouts need real devices.
- Mobile layouts of History, My Questions, Dashboard and Leaderboard were checked in code only.

## 7. Open items

- Regression checklist (42 lines, sections A to J) needs a full run. Rerun A, B and G after the forgot-password and profile work.
- Profile popup test (lint, build, 10 steps).
- Light theme.
- HR round (bank exists, round is not wired).
- Theory PDF parser for the 100 MERN questions PDF (answer key needed).
- Scheduled auto-delete sweep.
- Bulk-save endpoint for PDF import (one atomic request instead of one POST per question).
- Server-side anti-cheat heartbeat.
- Theory layout polish.
- Deployment host.