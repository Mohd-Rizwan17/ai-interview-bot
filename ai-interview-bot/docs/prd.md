# PRD: AI Interview Bot

## What it is
A mock interview practice app for MERN freshers. A user picks rounds and a difficulty, answers timed questions, and gets a graded review. An admin manages the question bank and watches overall performance.

No AI or LLM is called at runtime. Questions come from a local question bank, generators and admin-added custom questions. Theory answers are graded with a keyword rubric.

## Target users
- **User (student/fresher):** practises rounds, reviews mistakes, tracks progress.
- **Admin:** builds the question bank (manual add, PDF import), sees platform stats and the leaderboard. Admin is set by editing `role: "admin"` in MongoDB Compass. There is no UI for it.

## Features

### User
- Register and login (JWT in an httpOnly cookie). One device at a time: a second login gets a 409 and must confirm, which logs the other device out.
- Rounds: Aptitude, Reasoning, DSA, Frontend, Backend, My Questions, Mini Project. Rounds run in the order picked, 10 questions per round.
- Difficulty: easy, medium, hard.
- Question formats: MCQ, practical, descriptive, project (mini project).
- Hint costs 1 mark. Voice reads the question aloud.
- Anti-cheat: staying away from the window for 1 minute ends the interview with a cheating flag. A page refresh deducts marks after the first one.
- Review page with correct answers, model answers, explanations. "Show only mistakes" filter.
- History with search, pagination, delete, and auto-delete after 3 to 30 days.
- Dashboard: stats cards, score trend, round treemap, round radar, recent interviews, Start card.
- Product tour on first visit, "Take a tour" to replay.

### Admin
- Overview: question counts, how questions reach users, recent imports, top performers, needs-more-questions, all-users round performance.
- My Questions: add, filter, delete (max 200).
- PDF import: read in the browser, review drafts, edit, save.
- Leaderboard: podium for top 3, table from rank 4. Rank = average score of completed interviews, ties by more interviews. Only role "user".

### Mini Project round
Write code in the browser (Monaco, file tree, preview iframe, console). Not graded, saved automatically.

## Out of scope (for now)
Profile pictures, theory/Q&A PDF parser, HR round, scheduled auto-delete, "never delete" retention, light theme.

## Known limits
- Mini project: cross-file ES module imports do not run in the preview, an infinite loop can hang the tab, Monaco loads from a CDN (needs internet), requirement ticks are on screen only.
- Stats come only from interviews that still exist. Auto-delete and "Delete all" also lower the stats.
- Refresh penalty is taken from interview-level marks, so round bars can add up to 1 mark more than the total.
- Recent imports are grouped by source name. The same PDF name imported twice is one row.
- The admin leaderboard and round stats read all completed interviews into memory. Fine for small data, needs aggregation later.