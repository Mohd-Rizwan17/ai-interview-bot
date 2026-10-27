# Memory

## Purpose
A running log of the AI Interview Bot project: what was built, what is in progress, and what comes next. Update it after every finished step.

## What happened
- Backend and core interview flow built first (steps 1 to 24, voice, Mini Project, My Questions, PDF import).
- The Claude API and `aiService` were removed. The app no longer calls any AI. Questions come from the local bank, generators and custom questions.
- Roles added (user, admin), shared custom questions, planner by difficulty.
- Stats, Dashboard, Admin Overview, Leaderboard (S3 to S9).
- Redesign: theme tokens, glass surfaces, floating sidebar, auth cards, bento dashboard, loader, 404, product tour (R1 to R6, T1 to T6).
- Animations D1 to D5.
- S8 partly done: mobile drawer, "Not graded" for project-only history rows, sticky mobile timer, collapsed mini project workbench in Review.
- Lint and build are clean.

## Currently working on
Docs update and final QA.

## Updates
- 2026-10-27: PRD, architecture, rule, phase, design and memory docs rewritten. README and env docs still pending.

## Next
1. Theory layout polish (needs a screenshot of what feels wrong).
2. Full manual regression test.
3. README and env docs.
4. Deploy: cookie `sameSite: "none"`, CSRF, host choice.
5. Optional: light theme, HR round, theory PDF parser, auto-delete sweep, "never delete" retention.