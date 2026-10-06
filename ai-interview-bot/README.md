# AI Interview Bot

Practice mock interviews with an AI interviewer: MCQ and coding questions, aptitude and reasoning, voice, timer, follow-up questions, scoreboard and history.

## Stack
React (Vite) + Tailwind + Redux Toolkit + GSAP, Node.js + Express, MongoDB + Mongoose, Claude API.

## Docs
`prd.md`, `architecture.md`, `rule.md`, `phase.md`, `design.md`, `memory.md`

## Setup
```bash
git clone <your-repo-url>
cd ai-interview-bot

cd server && npm install
cp .env.example .env     # then fill in the values
npm run dev

cd ../client && npm install
npm run dev
```

## Environment variables (`server/.env`)
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5-5
```
Later (Phase 2): `GOOGLE_CLIENT_ID`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.

Never commit `.env`.

## Scripts
- server: `npm run dev`, `npm start`
- client: `npm run dev`, `npm run build`

## Status
See `phase.md`.
