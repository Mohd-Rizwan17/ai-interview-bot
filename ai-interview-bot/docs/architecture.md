# Architecture

## Stack
- Client: React (Vite, JavaScript), Tailwind CSS, Redux Toolkit, Axios, react-router (createBrowserRouter), GSAP
- Server: Node.js, Express, MongoDB with Mongoose
- Auth: JWT in an httpOnly cookie, bcrypt for passwords
- AI: Claude API, called only from the server
- PDF: multer + pdf-parse
- Voice: browser speechSynthesis (no API key)

## Folder structure
```
ai-interview-bot/
├── client/src/
│   ├── main.jsx
│   ├── routes/AppRoutes.jsx
│   ├── layouts/MainLayout.jsx
│   ├── pages/        Login, Register, Dashboard, InterviewRoom, Result, MiniTask, History, Profile, NotFound
│   ├── components/ui/constellation-grid.jsx
│   ├── components/   Timer, QuestionPanel, McqOptions, CodeAnswerBox, SidePanel, ScoreCard, ThemeToggle, VoiceReader
│   ├── hooks/        useTimer, useSpeech, useAntiCheat
│   ├── store/        index.js, authSlice.js, interviewSlice.js
│   ├── animations/   pageTransition.js, themeReveal.js
│   └── api/axios.js
└── server/
    ├── server.js
    └── src/
        ├── app.js
        ├── config/       db.js, env.js
        ├── models/       User.js, Interview.js, Attempt.js, MiniTask.js
        ├── routes/       auth, user, interview, stats
        ├── controllers/
        ├── middlewares/  auth, errorHandler, upload, validate, rateLimit
        ├── services/     aiService, pdfService, scoreService, sessionService
        ├── validators/
        └── utils/        ApiError, asyncHandler
```

## Data models
- User: fullName, username, email, phone, passwordHash (select: false), googleId (Phase 2), activeSession { sessionId, device, lastActiveAt, expiresAt }
- Interview: user, company, type, field (technical and mixed only), difficulty, status (in_progress, completed, incomplete, ended_cheating), totalQuestions (default 15), answeredQuestions, progressPercent, totalMarks, obtainedMarks, cheatingFlags, startedAt, endedAt
- Attempt: interview, order, source (ai or pdf), format (mcq, practical, descriptive), topic, question, options, correctOption (hidden by default), timeLimitSec, askedAt, status (asked, answered, timed_out, skipped), userAnswer, selectedOption, answeredAt, timeTakenSec, isCorrect, maxScore, score, hintUsed, feedback, idealAnswer, followUps[] (max 2)
- MiniTask: interview, prompt, promptHash (so tasks do not repeat), userSolution, feedback

## API (all under /api)
- Auth: POST register, login, login/confirm, logout; GET me
- User: PATCH users/me, PATCH users/me/password
- Interview: POST interviews, GET interviews, GET interviews/:id, POST interviews/:id/next, answers, followups, hint, cheat, finish
- Mini task: GET interviews/:id/mini-task, POST interviews/:id/mini-task
- Stats: GET stats/topics

## Single device login
1. Login succeeds: server creates a new sessionId, saves it in `user.activeSession`, and puts it in the JWT as `sid`.
2. If a non-expired `activeSession` already exists, login returns 409 `ALREADY_LOGGED_IN` with device info and a 5-minute `confirmToken` (the password is not kept on the client). The client shows the "logged in on another device" screen.
   If the request already carries the valid session cookie (same device), login goes through without a conflict.
3. "Logout other device and continue here" calls `login/confirm` with the `confirmToken`: server replaces `activeSession` and marks the running interview `incomplete` with `progressPercent`.
4. The old device's next request fails the sessionId check with 401 `SESSION_ENDED` and shows "You were logged out".

## Interview lifecycle
- A user can have only one `in_progress` interview (partial unique index on `user`).
- Starting a new interview, logging in (including from another device) or logging out turns any `in_progress` interview into `incomplete`.
- `incomplete` interviews show in history with their percent done and cannot be opened (403).
- `ended_cheating` is set by the cheat report. `completed` is set by finish, only after every question is processed.
- Status changes use one atomic update that only matches `in_progress`, so two requests cannot end the same interview twice.
- `progressPercent` and marks are recalculated from the attempts by `refreshProgress` (Part 4 calls it after every answer).
- While `in_progress`, correct answers are hidden. After the interview ends the report includes them.

## Question flow and scoring (Part 4)
- Marks: MCQ 2, descriptive 3, practical 5. Time: MCQ 60s, descriptive 120s, practical 300s (+5s grace).
- `POST next` creates the next question with Claude (forced tool call, validated JSON). Calling it again returns the same open question. An expired open question is closed as `timed_out`.
- Technical interviews rotate mcq, practical, descriptive. Aptitude and reasoning are MCQ. HR is descriptive. Mixed rotates all categories.
- MCQ is graded on the server from the stored correct option. Practical and descriptive answers are graded by Claude against a hidden reference answer.
- Answer states: `answered`, `skipped`, `timed_out`. Late answers become `timed_out`.
- Hint: once per question, costs 1 mark.
- Follow-ups: only for practical and descriptive answers scoring at least 60%. Maximum 2, 90s each, feedback only (no marks). The next question is blocked until the follow-up is answered, skipped or expired.
- The ideal answer is revealed when the answer is wrong, skipped or timed out (always for MCQ). All ideal answers appear in the report after the interview ends.
- If the AI call fails, the question is reopened so the user can retry (502).
- AI routes are limited to 120 requests per 15 minutes per user.

## Anti-cheat
- Client: `useAntiCheat` listens to visibilitychange, window blur and beforeunload, then calls `POST interviews/:id/cheat`.
- Server: sets status `ended_cheating`, adds a cheating flag, stops accepting answers.
- Detection is best effort. It cannot stop a second device.

## Timer
The server saves when each question was sent and rejects answers after the limit plus a small grace. The client timer is only for display.

## One question loop
question sent (timer starts, voice reads it) → answer → AI evaluates (JSON) → up to 2 follow-ups → ideal answer if the user failed → next question.

## Animations
See design.md. Background canvas only on Login and Register, never in the interview room.
