# AI Interview Bot

A mock interview practice app for MERN freshers. Pick rounds and a difficulty, answer timed questions, and get a graded review that shows what you missed. An admin builds the question bank and watches how everyone performs.

There is no AI call at runtime. Questions come from a local bank, formula generators and admin-written custom questions. Theory answers are graded with a keyword rubric, so the feedback can say what you covered and what you missed.

> **Practice project.** The forgot-password OTP is shown on screen, not emailed. Do not run this with real users until you read [Deployment notes](#deployment-notes).

## Features

**For users**
- Register and login with a JWT in an httpOnly cookie. One device at a time: a second login asks for confirmation and logs the first device out.
- Forgot password with a 6-digit OTP popup (60 seconds, new code on every resend, five tries).
- Profile popup: edit your name, change your password.
- Rounds: Aptitude, Reasoning, DSA, Frontend, Backend, My Questions, Mini Project. Each selected test is its own round and "Select all" picks the five standard ones.
- Interview room: server-checked round timer, submit per question, final submit, hints (cost 1 mark), questions read aloud by the browser.
- Anti-cheat: warning after 30 seconds away, interview ends after a long absence, refresh counted on the server (first one free, then a one-time 1 mark penalty).
- Review with your answer, the correct answer, the explanation, and a "mistakes only" filter.
- History with search, delete, delete all and auto-delete (3 to 30 days).
- Dashboard: stats, score trend, round treemap, round radar, recent interviews, a short product tour.
- Mini Project: build a small project (counter, stopwatch, todo, calculator, quiz) in a VS Code-like editor (Monaco) with a live sandboxed preview. Not graded.

**For admins**
- Overview: question bank counts by difficulty, recent PDF imports, all-users round performance, rounds that need more questions.
- Leaderboard: podium and ranking by average score.
- My Questions: add, filter and delete questions (Easy, Medium, Hard). Shared with all users.
- PDF import: the PDF is read in your browser, parsed into MCQ drafts, reviewed, de-duplicated and saved.

**Look**
- Glass UI with two themes: Modern Minimal for users, Lime Frost for admins. Animations respect reduced motion. Phones get a drawer menu.

## Tech stack

| Layer | Tools |
|---|---|
| Server | Node, Express 5, Mongoose 9, JWT, bcrypt, express-validator, helmet, cors, express-rate-limit |
| Client | React 19, Vite 8, Tailwind v4, Redux Toolkit, react-router, axios, GSAP, Monaco, pdfjs-dist |
| Database | MongoDB |

JavaScript only, ESM, Prettier with double quotes.

## Project structure

```
ai-interview-bot/
├── server/     Express API
└── docs/       prd, architecture, rule, phase, design, memory
 client/        React app
```

```
docs/
├── architecture.md
├── design.md
├── memory.md
├── phase.md
├── prd.md
└── rule.md
```

| Doc | What is inside |
|---|---|
| [`prd.md`](docs/prd.md) | What the product does, users, requirements, **known limits** |
| [`architecture.md`](docs/architecture.md) | Server and client structure, flows, API summary, decisions |
| [`rule.md`](docs/rule.md) | Code style, allowed and banned libraries, error handling, AI boundaries, Git |
| [`phase.md`](docs/phase.md) | Build phases, status, commit messages |
| [`design.md`](docs/design.md) | Themes, glass tiers, components, motion, responsive rules |
| [`memory.md`](docs/memory.md) | Current state, decisions, bug log, update log |

## Requirements

- Node v24
- MongoDB (local with Compass, or Atlas)

Keep the project outside OneDrive. `.git` and `node_modules` cause sync problems there.

## Setup

### 1. Server

```powershell
cd server
npm install
copy .env.example .env
```

Fill in `.env` (see the table below), then:

```powershell
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 2. Client

```powershell
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`. The server `CLIENT_URL` must be exactly this address, or the cookie and CORS will fail.

## Environment variables (server)

| Name | Required | Default | Notes |
|---|---|---|---|
| `MONGO_URI` | yes | none | MongoDB connection string |
| `JWT_SECRET` | yes | none | Long random string |
| `CLIENT_URL` | yes | none | Client address, for example `http://localhost:5173` |
| `PORT` | no | `5000` | |
| `NODE_ENV` | no | `development` | Use `production` when deployed |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |

The server stops at start-up with a clear message if a required variable is missing. There are no AI or mail keys, because the app does not use them.

Generate a secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts

| Where | Command | Does |
|---|---|---|
| server | `npm run dev` | Start with nodemon |
| client | `npm run dev` | Vite dev server |
| client | `npm run build` | Production build |
| client | `npm run lint` | ESLint (react-hooks rules are strict) |
| server | `node tests/bank.test.mjs` | Question bank and generator checks |

## Making an admin

There is no sign-up for admins.

1. Register a normal account.
2. Open MongoDB Compass, find the user in the `users` collection and set `role` to `"admin"`.
3. Log in again.

## API overview

Everything is under `/api`. Errors always look like `{ "success": false, "message": "..." }`. Full table in [`docs/architecture.md`](docs/architecture.md#36-api-summary).

| Area | Base | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, login/confirm, logout, me, forgot-password, verify-otp, reset-password, `PATCH /profile`, `PATCH /password` |
| Interviews | `/api/interviews` | create, rounds, answers, hint, finish, report, history, delete, `PATCH /retention`, `POST /:id/refresh` |
| Custom questions | custom question routes | admin writes, `GET /counts` for all users |
| Mini projects | `/api/mini-projects` | `GET /stacks`, `GET /:attemptId`, `PUT /:attemptId/files` |
| Stats | `/api/stats` | `GET /me`, `GET /admin`, `GET /leaderboard` |

## Testing the API in Postman

- Body type is always **raw + JSON**. With `Text`, no JSON content type is sent and the validators see an empty body (you get a 400).
- Login is single-device. If the account is already logged in somewhere, `/api/auth/login` returns **409** with a `confirmToken`. Send that token to `/api/auth/login/confirm` to continue. The other device is logged out. This is expected.
- To test two devices on one machine, use `localhost` for one and `127.0.0.1` for the other.

## Deployment notes

- **Remove the OTP from the forgot-password response before any real deploy.** In the controller, delete the `otp,` line and send the code by email instead. The rest of the flow stays the same.
- Set `NODE_ENV=production`. The cookie then uses `sameSite: "none"`, so serve over HTTPS.
- If the client and API are on different sites, use one parent domain or add CSRF protection.
- The Mini Project editor loads Monaco from a CDN, so it needs internet.
- Replace the default Vite favicon.
- Hosting is not decided yet.

## Known limits

Short version. The full list is in [`docs/prd.md`](docs/prd.md#6-known-limits).

- Theory grading is keyword based and approximate.
- The OTP is visible in the response (practice flow).
- Mini Project preview has no cross-file `import`, and an infinite loop can freeze the tab.
- Anti-cheat sees tab and window focus only. It cannot see another device or an AI tool.
- Deleting history also lowers your stats.
- Admin stats are computed in memory and will need aggregation at larger scale.

## Status

Latest work: forgot password and the profile popup (last step in test). A full regression run is still pending. See [`docs/memory.md`](docs/memory.md) for the current state and [`docs/phase.md`](docs/phase.md) for the plan.