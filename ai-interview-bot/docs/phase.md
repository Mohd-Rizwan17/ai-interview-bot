# Phases

## Phase 1: Core app
- [x] Part 1: Server setup. package.json, server.js, app.js, config/db.js, config/env.js, middlewares/errorHandler, utils/ApiError + asyncHandler, `.env.example`
  - Commit: `feat(server): set up Express server with MongoDB connection and error handling`
- [x] Part 2: Auth. User model, register, login, logout, me, single-device session, auth middleware
  - Commit: `feat(auth): add register, login, logout and single-device sessions`
- [x] Part 3: Interview models. Interview, Attempt, routes, controllers, progress and status handling
  - Commit: `feat(interview): add Interview and Attempt models with progress handling`
- [ ] Part 4: AI service. Generate MCQ, practical and aptitude/reasoning questions; evaluate; follow-ups; ideal answer
  - Commit: `feat(ai): add question generation, evaluation and follow-ups with Claude`
- [ ] Part 5: PDF service. Upload, extract text, extract questions
  - Commit: `feat(pdf): add PDF upload and question extraction`
- [ ] Part 6: Client base. Vite + Tailwind, AppRoutes, MainLayout, Redux, Axios, Login, Register, Dashboard, ConstellationGrid
  - Commit: `feat(client): set up React app with routes, auth pages and dashboard`
- [ ] Part 7: Interview room. Timer, question formats, side panel, voice, anti-cheat
  - Commit: `feat(interview-room): add timer, question formats, voice and anti-cheat`

## Phase 2: Extras
- [ ] Scoreboard and mistakes review
- [ ] Random mini task
- [ ] History and weak topics
- [ ] Profile edit and change password
- [ ] Hint system and adaptive difficulty
- [ ] Forgot password (needs email SMTP details) and Google signup (needs Google OAuth client)
- [ ] HR round, resume-based questions, report download
- [ ] Animations from the animation map
- [ ] Testing and QA
- [ ] Deployment and maintenance

## Done when
Each part works end to end and is tested with Postman (server) or in the browser (client) before the next part starts.
