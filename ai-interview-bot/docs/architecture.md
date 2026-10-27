# Architecture

## Stack
- **Server:** Node, Express 5, Mongoose 9, ESM, JWT (httpOnly cookie), bcrypt, express-validator
- **Client:** React 19, Vite 8, Tailwind v4, Redux Toolkit, react-router 8, axios, GSAP, lucide-react, @monaco-editor/react, pdfjs-dist
- **Database:** MongoDB
- **Language:** JavaScript only. Prettier, double quotes, ESM, arrow-function consts.

## Server (`server/src`)
```
app.js                 routes: /api/auth, /api/interviews, /api/custom-questions,
                       /api/mini-projects, /api/stats
config/                db.js, env.js
constants/interview.js USER_ROLES, DIFFICULTIES, QUESTIONS_PER_ROUND, MAX_CUSTOM_QUESTIONS, ...
controllers/           auth, interview, customQuestion, stats
middlewares/           auth (protect, adminOnly), errorHandler, rateLimit, validate
models/                User, Interview, Attempt, CustomQuestion
questionBank/          local questions + generators/
routes/                auth, interview, customQuestion, stats
services/              interviewFlow, interview, session, score, questionPlanner, history, stats
utils/                 asyncHandler, ApiError(status, message, code), ...
validators/            express-validator rules
miniProject/           mini project stacks and files
```
Pattern: route, validator, `validate` middleware, controller wrapped in `asyncHandler`, service holds the logic, errors thrown as `ApiError`.

## Client (`client/src`)
```
main.jsx, index.css
api/axios.js           withCredentials, SESSION_ENDED interceptor
constants/rounds.js
hooks/                 useTimer, useSpeech, useAntiCheat, useCardSlide
layouts/               MainLayout, AppShell, AuthLayout
routes/                AppRoutes, ProtectedRoute, AdminRoute
pages/                 Login, Register, Home, Dashboard, AdminOverview, Leaderboard,
                       History, InterviewRoom, Review, MyQuestions, ImportPdf, NotFound
components/            UI pieces (cards, charts, loader, tour, avatar, modals, ...)
store/                 index, auth, history, interview, review, customQuestion,
                       selection, stats, adminStats, toast slices
features/miniProject/  room, review, file tree, editor, preview, slice
utils/                 pdfText, parseQuestions, circleWipe, tourStorage
```

### Routes
- `/` MainLayout, then ProtectedRoute:
  - AppShell: index (Home: Dashboard for user, AdminOverview for admin), `history`, and inside AdminRoute `my-questions`, `pdf-import`, `leaderboard`
  - Outside AppShell (full screen): `interview/:id`, `interview/:id/review`
- Public: AuthLayout with `login` and `register`
- `*` NotFound

### Redux keys
`auth`, `history`, `interview`, `review`, `miniProject`, `customQuestions`, `selection`, `stats`, `adminStats`, `toasts`. Logout resets everything except `auth`. `toastSlice` listens to other slices' fulfilled actions, so no component dispatches a toast.

## API
- **Auth:** `POST /api/auth/register | login | login/confirm | logout`, `GET /api/auth/me`. Errors: 401 `UNAUTHORIZED` / `SESSION_ENDED`, 409 `ALREADY_LOGGED_IN`.
- **Interviews:** `POST /` {difficulty, rounds, projectStack?}, `GET /?page&limit&search`, `GET /:id`, `GET /:id/round`, `POST /:id/answers | hint | round/submit | finish | cheat | refresh`, `DELETE /:id`, `DELETE /`, `PATCH /retention`. 409 `INTERVIEW_ENDED`.
- **Custom questions:** `GET /counts` (any logged-in user), `POST`, `GET`, `DELETE /:id` (admin).
- **Mini projects:** `GET /stacks`, `GET /:attemptId`, `PUT /:attemptId/files`.
- **Stats:** `GET /api/stats/me`, `GET /api/stats/admin` (admin), `GET /api/stats/leaderboard` (admin).

## Key flows
- **Single-device login:** login while another session is active returns 409 with a `confirmToken`. `login/confirm` ends the other session and that browser gets `SESSION_ENDED`.
- **Interview:** start creates the Interview and plans questions per round (`questionPlanner`). Answers are saved per attempt. Submitting a round grades it and unlocks the next. Time up auto-submits what was saved.
- **Grading:** MCQ by option, descriptive/practical by keyword score (keywords found divided by total keywords). Mini project is not graded.
- **Stats:** only `completed` interviews with `totalMarks > 0` count toward scores.
- **My Questions round:** picks 10 random custom questions of the chosen difficulty (400 if none).