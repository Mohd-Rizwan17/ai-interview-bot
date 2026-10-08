export const react = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Hooks",
    question: "Which hook is used to manage state in a function component?",
    options: ["useEffect", "useState", "useRef", "useContext"],
    correctOption: 1,
    explanation:
      "useState returns the current state value and a setter function. Calling the setter updates the state and re-renders the component.",
    hint: "Its name has the word 'state' in it.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Lists",
    question: "Why do we add a key prop when rendering a list in React?",
    options: [
      "To style each item",
      "To help React identify which items were added, changed or removed",
      "To make each item clickable",
      "To sort the list automatically",
    ],
    correctOption: 1,
    explanation:
      "Keys give each list item a stable identity, so React can update only the items that changed instead of re-creating the whole list.",
    hint: "Think about how React compares the old list with the new one.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Hooks",
    question: "When does useEffect with an empty dependency array [] run?",
    options: [
      "On every render",
      "Only after the first render (mount)",
      "Only when state changes",
      "Never",
    ],
    correctOption: 1,
    explanation:
      "An empty dependency array means the effect has nothing to watch, so it runs once after the first render. Its cleanup function runs when the component unmounts.",
    hint: "No dependencies means nothing can trigger it again.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "State",
    question: "Why should you not change state directly, like state.count = 5?",
    options: [
      "It is slower",
      "React will not know the state changed, so the UI will not re-render",
      "JavaScript throws an error",
      "It deletes the component",
    ],
    correctOption: 1,
    explanation:
      "React re-renders only when the setter function is called. Changing the value directly skips that, so the screen and the data go out of sync.",
    hint: "How does React find out that something changed?",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "State",
    question:
      "count is 0. In one click handler you call setCount(count + 1) three times. What is count after the render?",
    options: ["3", "1", "0", "It throws an error"],
    correctOption: 1,
    explanation:
      "All three calls use the same count value (0) from that render, so each one sets the state to 1. To get 3 you need the updater form: setCount((c) => c + 1).",
    hint: "Each call reads the same count from the current render.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Props and State",
    question: "What is the difference between props and state in React?",
    idealAnswer:
      "Props are data passed from a parent component to a child. The child can only read them and must not change them. State is data that a component owns and manages inside itself. It can be changed with its setter function, and every change re-renders the component.",
    keywords: [
      ["parent", "passed", "pass", "from outside"],
      ["read-only", "readonly", "read only", "immutable", "cannot change"],
      ["inside", "within", "own", "local", "internal", "manage"],
      ["re-render", "rerender", "re-renders"],
    ],
    explanation:
      "A good answer says props come from the parent and are read-only, while state is owned by the component and its change triggers a re-render.",
    hint: "One comes from outside the component, the other lives inside it.",
  },
  {
    format: "descriptive",
    difficulty: "hard",
    topic: "Hooks",
    question:
      "Why do we need a cleanup function in useEffect? Give an example.",
    idealAnswer:
      "The cleanup function runs before the effect runs again and when the component unmounts. It is used to remove event listeners, clear timers and cancel subscriptions. Without it you get memory leaks and duplicate or stale work. Example: start a timer with setInterval inside the effect and return a function that calls clearInterval.",
    keywords: [
      ["unmount", "before the next", "re-run", "rerun", "runs again"],
      ["listener", "timer", "interval", "subscription", "timeout", "websocket"],
      ["leak", "bug", "stale", "duplicate"],
      ["clearinterval", "cleartimeout", "removeeventlistener", "unsubscribe"],
    ],
    explanation:
      "A good answer says when the cleanup runs, what it is used for, and gives a real example like clearInterval or removeEventListener.",
    hint: "Think about a timer or an event listener that keeps running after the component is gone.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "Hooks",
    question:
      "Write a React component named Counter with a button. Each click should increase the number shown on the button.",
    idealAnswer: `import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};

export default Counter;`,
    keywords: [["usestate"], ["onclick"], ["return"]],
    explanation:
      "useState holds the count, onClick calls the setter, and the new value is shown in the button text after the re-render.",
    hint: "You need one state value and one click handler.",
  },
];
