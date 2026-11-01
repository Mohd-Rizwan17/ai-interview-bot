# Rules

What to use, what to avoid, and how we work on this project. If a rule here and the code disagree, fix one of them and say which.

## 1. Code style

- **JavaScript only.** No TypeScript. ESM everywhere (`import` / `export`).
- Prettier, double quotes, arrow-function consts: `const getUser = async () => {}`.
- Few comments. Names should explain the code.
- Keep the existing naming and structure. Change only what the task needs. Refactor only when asked.
- No clever one-liners. No abstraction before there are two real uses.
- No new library unless the work would get worse without it. Say why in the commit or the reply.
- Success is always green (`ok` token), never the accent colour.

## 2. Stack and libraries

**Use**

| Side | Libraries |
|---|---|
| Server | express 5, mongoose 9, jsonwebtoken, bcrypt, express-validator, helmet, cors, cookie-parser, express-rate-limit, dotenv, nodemon (dev) |
| Client | react 19, vite 8, tailwindcss 4, @reduxjs/toolkit, react-redux, react-router, axios, gsap, @monaco-editor/react, pdfjs-dist (lazy) |

**Avoid** (decided, with reasons)

| Do not use | Reason |
|---|---|
| TypeScript | More setup, same stack otherwise |
| `@anthropic-ai/sdk` or any AI SDK at runtime | AI removed. See section 6 |
| Recharts, Chart.js | Charts are small and hand-made |
| framer-motion | GSAP is enough |
| react-hot-toast, sonner | `toastSlice` and `ToastHost` exist |
| Radix, Headless UI, shadcn install | Native `<dialog>` and own components |
| three.js, tsparticles, particles.js | 2D canvas is enough, and works offline |
| lodash | A 10-line `setTimeout` debounce is enough |
| RTK Query | Whole project uses `createAsyncThunk` |
| express-session, Redis | JWT cookie and one DB field are enough |
| multer, pdf-parse (server) | PDFs are read in the browser |
| nodemailer | Mail was dropped. Add it only when the OTP goes real |
| CommonJS, `--env-file` | ESM and dotenv are the project standard |

**Never run** `npm audit fix --force`. It makes breaking upgrades silently. Update the one package: `npm uninstall x` then `npm i -D x@latest`.

## 3. Structure rules

- Server: routes → validators → controller → service → model. Controllers stay thin. Rules live in services.
- Pure logic (stats, file tree, parsing) goes in plain functions so it can be tested on sample data.
- Constants (limits, penalties, formats) live in `constants/`. No magic numbers in services. Client limits that mirror the server (file tree, form rules) are copied on purpose and must be kept in sync.
- New feature that may be removed later gets its own folder with few touch points (Mini Project is the model).
- React routes always use `createBrowserRouter` and `RouterProvider` inside `AppRoutes`: a `MainLayout` wrapper at `/` with nested children, an index route for Home, path routes for pages, and a catch-all `*` for `NotFound`.
- A component file does one job. Use existing components before writing new ones (`StatCard`, `RoundBars`, `ConfirmModal`).
- One-time-per-browser flags (tour seen) use `localStorage`. Never use `localStorage` for anything the server must trust.

## 4. Error handling

**Server**
- Throw `ApiError(status, message)`. Wrap controllers in `asyncHandler`.
- Every error leaves as `{ success: false, message }`.
- Validate every write with `express-validator`. Use `isString()` on text fields so objects cannot slip in.
- Machine-readable codes where the client must react: `SESSION_ENDED`, `EMAIL_NOT_FOUND`, `WRONG_PASSWORD`, `OTP_EXPIRED`, `OTP_BLOCKED`.
- Status choices: 409 for a login conflict or deleting a running interview, 403 for opening an incomplete interview or a non-admin, 400 for a wrong current password (not 401, so the client does not log the user out).
- Login error text is the same for wrong email and wrong password.
- Required env variables are checked at start-up. Missing one stops the server with a clear message.
- Never send correct answers or secrets to the client during an interview. Never log tokens or OTPs.

**Client**
- Thunks use `rejectWithValue`. Pages show errors inline, near the action that failed.
- Only success shows a toast. Cheating and refresh banners never auto-hide.
- Destructive actions (delete interview, delete all, shorter retention, delete file or folder, delete question) use `ConfirmModal`, Cancel focused first. No `window.confirm`.
- A failed save must not look like success. Mini Project Submit is blocked if `flushProject` fails.
- Slow loads show a loader only after 400 ms. No fake delays.

## 5. Security rules

- Passwords: bcrypt cost 12. New password: 8 to 72 characters, at least one letter and one number. The same rule everywhere.
- Cookies: `httpOnly`. Production: `secure` and `sameSite: "none"`.
- Rate limit login, OTP and password change.
- The Mini Project preview iframe stays sandboxed **without** `allow-same-origin`.
- Reject path traversal (`../`) and duplicate paths in project files. Max size 200 KB per project.
- The OTP in the API response is allowed **only** for local practice. Before any real deploy, remove it.
- Do not store anything about users beyond what the product needs.

## 6. AI boundaries

**In the product**
- No AI call at runtime. No AI keys in `.env`.
- If AI returns, it goes in one new service file, behind a switch, never in controllers. The key stays on the server.
- Treat any text a model returns as untrusted input.

**When using an AI assistant to write code**
- Share the exact file when asking for a fix. The assistant must not guess files it has not seen.
- The assistant must say what it did **not** test. Code written by reading is not tested code.
- Do not apply a generated change blindly. Read the diff, run lint and build, then test the step.
- Honest pushback is wanted when an approach is weak for a professional project.
- Missing critical values (URLs, secrets, schemas) must be asked for, never invented.

## 7. Working process

1. Plan or blueprint before any large feature or design.
2. One small step at a time. Wait for the test result before the next step.
3. For each step: files changed, why, test steps, then `git add` and `git commit` for only those files.
4. If many places change, replace the whole file. If one or two small places change, show only that part and where it goes.
5. Debug in this order: read the error, find the root cause, name the file to change, give the fix, say how to test.
6. Priorities: correctness, simplicity, maintainability, performance, clever code last.

**Before calling a step done**
- `npm run lint` and `npm run build` are clean.
- The step's test list is run in the browser or Postman.
- For auth, session or shell changes: rerun regression sections A, B and G.

**Postman:** body type is always `raw` + `JSON`. `Text` sends no JSON content type, `express.json()` skips the body and validators see `undefined`.

**Local two-device test:** use `localhost` for one device and `127.0.0.1` for the other.

## 8. Git

- Root `.gitignore` covers `node_modules`, `.env`, build output and logs.
- Commit `.env.example`, never `.env`.
- One commit per step, conventional format, small and readable history.

| Type | Use for | Example |
|---|---|---|
| `feat` | New behaviour | `feat(auth): add forgot password with OTP popup` |
| `fix` | Bug fix | `fix(attempt): add hintUsed to schema` |
| `refactor` | No behaviour change | `refactor(stats): extract buildByRound` |
| `style` | Look only | `style(ui): glass tokens in index.css` |
| `docs` | Docs | `docs: update prd, architecture, rule, phase, design, memory` |
| `chore` | Tooling, cleanup | `chore: remove unused interviewLimiter` |
| `test` | Tests | `test(bank): add question bank checks` |

Scopes in use: `auth`, `interview`, `history`, `mini-project`, `stats`, `admin`, `ui`, `docs`.

## 9. UI rules

- Interview room, modals and toasts use **solid** panels. No blur there.
- Use `glass` panels sparingly. Around 6 blur panels on one screen is the ceiling. Dashboard went to 8 once and was kept only to test.
- Do not animate `filter: blur`. Animate `transform` and `opacity`.
- Every animation must have a reduced-motion version. Fade stays, movement goes.
- Colours come from tokens. Never hard-code a hex in a component.
- Mobile: no horizontal scroll, sticky timer in the room, drawer for the sidebar.
- Match any screenshot or design the user provides.