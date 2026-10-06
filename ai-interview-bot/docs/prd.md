# PRD: AI Interview Bot

## What we are building
A MERN web app where a user practises mock interviews with an AI interviewer. The AI asks questions, listens to answers, cross-questions, scores, and explains better answers.

## Target users
- Freshers and juniors preparing for MERN / full stack interviews
- Students preparing for aptitude and reasoning rounds

## Interview setup (Dashboard)
- Company name
- Type: Technical, Aptitude, Reasoning, HR, Mixed
- Field (Technical only): Full Stack, Frontend, Backend
- Difficulty: Easy, Medium, Hard
- Optional PDF upload: questions from the PDF are mixed with AI questions

## Interview room
- Question formats: MCQ, practical (write code), descriptive
- Timer on every question; time out counts as unanswered
- AI reads each question aloud (browser speech), "Read again" button
- After an answer the AI evaluates it, then asks up to 2 follow-ups ("why this approach", "what else could you use")
- If the user cannot answer, the AI gives a clear ideal answer
- Hint button costs 1 mark
- Side panel: "Your PDF questions" and "AI questions", current one highlighted
- Anti-cheat: switching tab, opening a new tab or leaving the page ends the interview and adds a cheating flag

## After the interview
- Scoreboard: total, obtained, right, wrong, cheating flag
- Mistakes review with the ideal answer for each mistake
- Random mini task (5 to 10 minutes), different every time
- History: completed, incomplete (with percent done, cannot be opened) and cheating-ended interviews
- Weak topics (JavaScript, React, MongoDB, Node.js, Aptitude, and so on)

## Accounts
- Register, login, logout; forgot password; Google signup
- Profile: edit username and personal details; change password
- One device at a time: a second login must confirm, which logs out the first device and marks its running interview incomplete
- Passwords are only ever stored as bcrypt hashes and never returned or shown anywhere

## Extras
Adaptive difficulty, resume-based questions, HR round, report download, light and dark theme.

## Not in version 1
- Running user code on the server (AI reviews code instead)
- Live human interviewers
- Native mobile apps (responsive web only)

## Success looks like
A user can register, take a timed interview with voice and follow-ups, see a correct scoreboard, review mistakes, and find the interview in history.
