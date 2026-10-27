# AI Interview Bot

A mock interview practice app for MERN freshers. Pick rounds and a difficulty, answer timed questions, and get a graded review. An admin builds the question bank and watches performance.

There is no AI call at runtime. Questions come from a local bank, generators and custom questions. Theory answers are graded with a keyword rubric.

## Features
- Register and login with JWT in an httpOnly cookie, one device at a time
- Rounds: Aptitude, Reasoning, DSA, Frontend, Backend, My Questions, Mini Project
- Timer, hints, voice reading, anti-cheat, review with model answers
- History with search, delete and auto-delete
- User dashboard: score trend, round treemap, round radar
- Admin: overview, leaderboard, custom questions, PDF import
- Mini Project: code in the browser with Monaco and a live preview

## Tech stack
- **Server:** Node, Express 5, Mongoose 9, JWT, bcrypt, express-validator
- **Client:** React 19, Vite 8, Tailwind v4, Redux Toolkit, react-router 8, axios, GSAP
- **Database:** MongoDB

## Project structure
```
client/                    React app
ai-interview-bot/server/   Express API
docs/                      prd, architecture, rule, phase, design, memory
```

## Requirements
- Node v24
- MongoDB (local with Compass, or Atlas)

## Setup

### 1. Server
```powershell
cd ai-interview-bot/server
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
The app runs on `http://localhost:5173`. Make sure the server `CLIENT_URL` is exactly this address.

## Environment variables (server)
| Name | Required | Default | Notes |
|---|---|---|---|
| `MONGO_URI` | yes | none | MongoDB connection string |
| `JWT_SECRET` | yes | none | Long random string |
| `CLIENT_URL` | yes | none | Client address, for example `http://localhost:5173` |
| `PORT` | no | `5000` | |
| `NODE_ENV` | no | `development` | Use `production` when deployed |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |

The server stops at start-up with a clear message if a required variable is missing.

Generate a secret:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts
Client: `npm run dev`, `npm run build`, `npm run lint`.

## Making an admin
There is no sign-up for admins. Register a normal account, open MongoDB Compass, find the user in the `users` collection and set `role` to `"admin"`. Log in again.

## Testing the API in Postman
Always use body type raw with JSON. Login is single-device: if the account is already logged in somewhere, `/api/auth/login` returns 409 with a `confirmToken`. Send that token to `/api/auth/login/confirm` to continue. The other device is logged out. This is expected.

## Deployment notes
- Set `NODE_ENV=production`. The cookie then uses `sameSite: "none"`, so serve over HTTPS.
- If the client and API are on different sites, use the same parent domain or add CSRF protection.
- The mini project editor loads Monaco from a CDN, so it needs internet.

## Known limits
See `docs/prd.md`.