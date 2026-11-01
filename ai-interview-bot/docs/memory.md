# Memory

Running log of the project: why it exists, what happened, what is being worked on now, and what changed. Update this at the end of every step. A new person (or a new AI chat) should be able to read only this file and continue.

## 1. Purpose

AI Interview Bot is a mock interview practice app for MERN freshers, built by Mohd Rizwan while learning the MERN stack at Sheryians Coding School. It doubles as a portfolio project and as interview material.

There is no AI at runtime. Questions come from a local bank, generators and admin custom questions. Theory is graded with keywords.

## 2. Current state (1 Nov 2026)

**Working on:** Phase 8 Step 4, the profile popup (`ProfileModal`, opened from the sidebar and mobile avatar in `AppShell`). Code is written. Test result is pending: lint, build, then 10 manual steps.

**Tested and committed:** everything from Phase 0 to Phase 7, and Phase 8 Steps 1 to 3.

**Not run yet:**
- Full 42-line regression checklist (sections A to J). Rerun A, B and G after the auth, session and shell changes.
- Mobile checks for History, My Questions, Dashboard, Leaderboard.

**Next:** finish Step 4, update README and docs (this change), then regression, then deploy prep.

## 3. Timeline

| Stage | What happened |
|---|---|
| Start | Interview prep from the 100 MERN questions PDF. Idea of an AI interview bot. Stack and rules decided |
| Mockup and docs | Design boards, first docs, Word plan, `.gitignore`, commit conventions |
| Part 1 to 3 | Server setup, auth with single-device login, interview models |
| Part 4 (removed) | Claude-based question and answer service. Two things went wrong: a wrong file version from another session, then "credit balance too low". AI was removed |
| Pivot | Local bank, generators, keyword grading, round-based design |
| Backend 2 to 13, Client 14 to 20 | Engine, banks, room, timer, hint, review |
| 21 to 24 | History, retention, anti-cheat, hint penalty fix |
| Voice | Browser speech reads questions |
| Mini Project | Own server and client module, Monaco editor, preview, review |
| Review and cleanup | Custom question formats, unused limiter, env cleanup |
| My Questions and PDF import | List, form, browser PDF parser, review screen |
| Roles and difficulty | Admin role, shared questions, difficulty, S1 to S2b |
| Dashboards | S3 to S5, then S9 leaderboard |
| Look | S6 modal and toast, D0 theme, R1 to R6 glass, T1 to T6 new themes and components |
| Motion | D1 to D5 |
| Mobile | S8 drawer and fixes |
| Docs | First full docs, README, `.env.example`, regression checklist |
| Forgot password and profile | Steps 1 to 4 (this is the latest work) |

## 4. Decisions log

| Decision | Reason |
|---|---|
| JavaScript only | Matches the stack, less setup |
| Remove the AI API | Cost and billing failure. Local bank is reliable |
| Keyword grading, with self-grading as a possible later option | Automatic and shows what was missed. It is approximate |
| Generators for aptitude and reasoning | Formula answers are exactly right |
| Round per selected test, round timer, no cross-questions, hint costs 1 mark | New round-based design |
| One device at a time, confirm token | Realistic interview, and a phone cookie cannot end a desktop session |
| Server checks time | Client timers can be bypassed |
| Cheat = long absence, not just a tab switch | Short glances are normal. Blur events were too noisy |
| Refresh: first is free, then 1 mark once | Honest refreshes happen. Count kept on the server |
| Custom questions only in My Questions round, picked by difficulty | A single bank of Easy questions was leaking into Medium and Hard |
| Admin made by editing `role` in Compass | No sign-up for admins, no env redeploy |
| Leaderboard by average % | Fair to people with fewer interviews |
| Mini Project is ungraded | Free-form HTML cannot be scored without AI or brittle tests |
| Separate `ProjectWork` collection | `Attempt` stays small |
| PDF read in the browser | No server upload or storage |
| Glass look with a role theme, solid in the room | Looks good, and stays readable where it matters |
| 2D canvas dots, own loader, own tour, own charts | No heavy libraries |
| OTP shown in a popup, no email | Mail was dropped. Practice flow only |
| Profile: name and password only | Email edit was not asked for |
| Wrong current password returns 400 | A 401 could make the client log the user out |

## 5. Bugs found and fixed

| Bug | Root cause | Fix |
|---|---|---|
| Retention PATCH returned 400 in Postman | Body type was `Text`, so no JSON content type, `req.body.days` undefined | Use raw + JSON |
| Debug log printed nothing | Snippet pasted outside the route | Pass it as an argument in the route |
| `reading 'category'` 500 | Wrong `aiService.js` version from a shared folder | Correct file given. Later the AI service was removed |
| Register then login gave 409 | Same device not recognised | `isCurrentDevice` |
| `/answers` 500 on empty POST | Express 5 leaves `req.body` undefined | `req.body ??= {}` |
| Hint penalty never applied, hint vanished on reload | `hintUsed` missing in the schema, Mongoose strict mode dropped it | Added to `Attempt` |
| Incomplete interview showed 0% | No `null` handling | `buildStats` returns `null` |
| Admin "How questions reach users" guessed wrong | Plan was based on a guess, not on the design PDF | Rebuilt as three bars |
| Easy questions in Medium and Hard | Custom questions had no difficulty | Difficulty field and planner filter |
| Sidebar tick for project only after refresh | Client state never learned about the autosave | Server returns `answered`, slice listens |
| Extra page scrollbar after R2 | `min-h-screen` plus new padding | Removed `min-h-screen` in R5 |
| Blank mockup boards | Script wrote the `<x-dc>` tag twice | Fixed |
| White page, "no export named default" | `MiniProjectRoom.jsx` saved empty | Re-saved |
| `ERR_MODULE_NOT_FOUND` | A file was never created | Created it |
| `Failed to resolve ./hooks/useAutosave.js` | File in the wrong folder | Moved |
| Invalid hook call | `ProjectReview.jsx` mismatch | Whole file replaced |
| 6 lint errors | Ref read in render, setState in effect, unused import | Used state, mounted tour when open, removed import |
| Monaco "Canceled" console messages | Monaco's own message when disposing | Not hidden with a hack |
| Tour seemed not to run | Seen flag is in `localStorage` for that browser | Documented |

## 6. Verification notes

Most code was written by reading, not by running. What the developer tested by hand counts as tested. What was run in a sandbox:
- `buildStats`, `buildAdminStats`, canvas logic, the PDF parser on the real PDF text, the question bank (88 items), generators (40,500 generated questions against a separate formula), `fileTree.js`, `counts` logic, every JSX file syntax check.
- The partial unique index could not be tested in the sandbox database. It worked on Atlas.

Not checked by running: browser rendering, blur performance, mobile layouts, design boards.

## 7. Environment

| | |
|---|---|
| Machine | Windows, PowerShell |
| Node | v24 |
| Client | Vite 8 |
| Server | nodemon |
| DB tool | MongoDB Compass |
| API testing | Postman, body raw + JSON |
| Test commands | `node tests/bank.test.mjs` (server), `check-tree.mjs` (client, run from its own folder) |

## 8. Files to keep in mind

- `server/.env.example` is the env reference. Real `.env` is never committed.
- Docs: `prd.md`, `architecture.md`, `rule.md`, `phase.md`, `design.md`, `memory.md`.
- Regression checklist: 42 lines, sections A to J.
- Animation spreadsheet and design canvas (12 boards) were made earlier. The canvas is older than the final Modern Minimal and Lime Frost themes, so use `design.md` as the current truth.

## 9. Update log

| Date | Update |
|---|---|
| 2026-10-14 | Mini Project phase 3 finished |
| 2026-10-23 | S9 leaderboard, D1, glass redesign R1 to R5b committed |
| 2026-10-27 | T1 to T6, D1 to D5, S8 done |
| 2026-11-01 | Forgot password and profile started. Steps 1 to 3 committed. Step 4 in test. Docs and README rewritten |

When you add a row, also update section 2.