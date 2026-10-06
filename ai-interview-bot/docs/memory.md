# Memory

## Purpose
Keeps track of what happened, what is being worked on, and decisions, so any session can continue without re-explaining.

## Decisions so far
- App: AI Interview Bot on the MERN stack
- Language: JavaScript (not TypeScript)
- AI provider: Claude API, called only from the server
- Voice: browser speechSynthesis
- Animation: GSAP; ConstellationGrid as the Login/Register background
- No Next.js and no three.js
- One device login at a time; tab switch ends the interview with a cheating flag
- Passwords stay hashed everywhere

## What happened
- Interview prep started from the Sheryians 100 MERN questions PDF, with JavaScript questions added
- Idea turned into this app; mockup built and revised (auth, dashboard, conflict, history, cheating, animation map)
- Docs written: prd, architecture, rule, phase, design, memory, README

## Currently working on
Phase 1, Part 4: AI service (code written, waiting for the Postman test with the real Claude key)

## Pending
- `ANTHROPIC_API_KEY` in `server/.env` (needed from Part 4)
- Scoreboard screen design
- Email SMTP and Google OAuth details for Phase 2

## Updates
- 2026-10-05: docs created, stack and AI provider decided
- 2026-10-05: Part 1 done and running (Mongo connected, JWT secret set); Part 2 auth written and tested in Postman, including the two-device flow
- 2026-10-05: Part 3 interview models, routes and session hooks written and tested in Postman
- 2026-10-05: Part 4 AI service written: question generation, grading, follow-ups, hints, timers
