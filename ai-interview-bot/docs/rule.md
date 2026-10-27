# Rules

## Use
- JavaScript, ESM, Prettier with double quotes, arrow-function consts.
- Server: `asyncHandler`, `ApiError(status, message, code)`, validators plus `validate` middleware, services for logic.
- Client: Redux Toolkit with `createAsyncThunk` and `rejectWithValue`, axios instance from `api/axios.js`.
- Routes: `createBrowserRouter` plus `RouterProvider` inside `AppRoutes`, MainLayout at `/`, catch-all `*` to NotFound.
- Tailwind classes and the theme tokens in `index.css`. Icons from lucide-react.

## Avoid
- TypeScript, shadcn install, three.js, framer-motion, extra libraries without a clear need.
- Over-engineering, clever one-liners, long comments.
- `window.confirm` (use `ConfirmModal`), toasts dispatched from components (the toast slice listens instead).
- Renaming existing files or structure unless a refactor is asked for.

## Libraries and dependencies
Already in the project: express, mongoose, jsonwebtoken, bcrypt, express-validator, react, redux toolkit, react-router, axios, tailwindcss, gsap, lucide-react, @monaco-editor/react, pdfjs-dist. Add a new one only when the work would be clearly worse without it.

## Error handling
- Server throws `ApiError`; `errorHandler` turns it into `{ success: false, message, code }`.
- Client thunks return `rejectWithValue(message)`. Pages show the message in `text-danger` or a `Notice`.
- Never trust the client for role, marks or time. The server checks them.
- 401 `SESSION_ENDED` logs the browser out through the axios interceptor.

## Security
- JWT in an httpOnly cookie, passwords hashed with bcrypt, rate limiting on auth.
- `protect` on all private routes, `adminOnly` on admin routes (403 `FORBIDDEN`).
- On deploy the cookie becomes `sameSite: "none"` (cross-site). Use the same parent domain or add CSRF protection.

## AI boundaries
- No AI or LLM call anywhere in the app. Questions come from the local bank, generators and custom questions.
- Grading is deterministic (option match or keyword rubric). Do not describe it as AI grading.

## UI
- Surfaces: `glass` (cards), `glass-strong` (sidebar, auth card), `glass-solid` (anything with Monaco, iframe, long lists, modals). Never put blur on top of blur. About six blurred panels per screen at most.
- Accent is for brand, primary and active states only. Green is every success state (Correct, Completed, Saved, 70%+). Red is only for cheating and wrong.
- Motion: hover 150ms, press scale .97 for 120ms, modal 200ms, toast and banner 250ms, page enter 300ms, list stagger 40ms (max 6 rows). Reduced motion means a plain fade only.

## Git
- One step, one commit, only the changed files, after the test passes.
- Client paths `client/...`, server paths `ai-interview-bot/server/...`. Check against `git status`.

## Windows setup
PowerShell, Node v24, Vite 8, nodemon, MongoDB Compass, Postman (body is always raw plus JSON).