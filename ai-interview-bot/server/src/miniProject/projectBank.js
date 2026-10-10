import { ApiError } from "../utils/ApiError.js";
import { shuffle } from "../utils/random.js";

const WEB_STARTER_FILES = [
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mini Project</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <script src="script.js"></script>
  </body>
</html>
`,
  },
  { path: "style.css", content: "" },
  { path: "script.js", content: "" },
];

export const STACKS = {
  web: { label: "HTML / CSS / JavaScript", starterFiles: WEB_STARTER_FILES },
};

const PROJECTS = [
  {
    id: "counter",
    title: "Counter App",
    stack: "web",
    difficulty: "easy",
    timeLimitSec: 15 * 60,
    description:
      "Build a counter that the user can increase, decrease and reset.",
    requirements: [
      "Show the current count on the page, starting at 0",
      "An Increase button adds 1 and a Decrease button subtracts 1",
      "A Reset button sets the count back to 0",
      "The count turns red when it is below 0",
    ],
  },
  {
    id: "stopwatch",
    title: "Stopwatch",
    stack: "web",
    difficulty: "easy",
    timeLimitSec: 20 * 60,
    description: "Build a stopwatch that shows minutes, seconds and tenths.",
    requirements: [
      "Show the elapsed time in mm:ss.t format, starting at 00:00.0",
      "Start begins counting and Stop pauses it",
      "Start after Stop continues from where it paused",
      "Reset stops the stopwatch and returns the time to 00:00.0",
    ],
  },
  {
    id: "todo-list",
    title: "Todo List",
    stack: "web",
    difficulty: "medium",
    timeLimitSec: 30 * 60,
    description: "Build a todo list where the user manages a list of tasks.",
    requirements: [
      "Add a task from an input field using a button or the Enter key",
      "Do not add empty tasks",
      "Mark a task as done, shown with a line through the text",
      "Delete a single task",
      "Show how many tasks are still pending",
    ],
  },
  {
    id: "calculator",
    title: "Calculator",
    stack: "web",
    difficulty: "medium",
    timeLimitSec: 30 * 60,
    description: "Build a calculator that does basic arithmetic.",
    requirements: [
      "Buttons for digits 0 to 9 and a decimal point",
      "Buttons for add, subtract, multiply and divide",
      "An equals button shows the result",
      "A clear button resets the display",
      "Dividing by zero shows an error message instead of Infinity",
    ],
  },
  {
    id: "quiz-app",
    title: "Quiz App",
    stack: "web",
    difficulty: "hard",
    timeLimitSec: 45 * 60,
    description:
      "Build a quiz that asks multiple choice questions and shows a final score.",
    requirements: [
      "Keep at least 5 questions with 4 options each in a JavaScript array",
      "Show one question at a time with its options",
      "Selecting an option shows whether it was correct before moving on",
      "A Next button moves to the following question",
      "After the last question, show the score and a Restart button",
    ],
  },
];

export const findProject = (id) =>
  PROJECTS.find((project) => project.id === id);

export const pickProjectQuestion = (stack, difficulty) => {
  const inStack = PROJECTS.filter((project) => project.stack === stack);

  if (inStack.length === 0) {
    throw new ApiError(
      501,
      "Mini projects are not available for this stack yet",
    );
  }

  const matching = inStack.filter(
    (project) => project.difficulty === difficulty,
  );
  const [project] = shuffle(matching.length > 0 ? matching : inStack);

  return {
    format: "project",
    topic: project.title,
    question: project.description,
    options: [],
    projectTimeSec: project.timeLimitSec,
    project: { id: project.id, stack },
  };
};
