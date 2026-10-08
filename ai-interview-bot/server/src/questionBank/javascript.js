export const javascript = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "JavaScript",
    question: "What does typeof null return?",
    options: ["null", "object", "undefined", "number"],
    correctOption: 1,
    explanation:
      "typeof null returns 'object'. This is a long-standing bug in JavaScript that was never fixed to avoid breaking old code.",
    hint: "It is a historical bug in the language.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "JavaScript",
    question: "What is the output of 0.1 + 0.2 === 0.3 ?",
    options: ["true", "false", "undefined", "TypeError"],
    correctOption: 1,
    explanation:
      "Numbers are stored as binary floating point, so 0.1 + 0.2 gives 0.30000000000000004, which is not equal to 0.3.",
    hint: "Think about how decimals are stored in binary.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Arrays",
    question:
      "Which of these array methods does NOT change the original array?",
    options: ["push", "splice", "map", "sort"],
    correctOption: 2,
    explanation:
      "map returns a new array. push, splice and sort all change the original array.",
    hint: "Only one of them returns a brand new array.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Arrays",
    question: "What is the output of [1, 2, 3].map(parseInt) ?",
    options: ["[1, 2, 3]", "[1, NaN, NaN]", "[NaN, NaN, NaN]", "[1, 2, NaN]"],
    correctOption: 1,
    explanation:
      "map passes (value, index) to parseInt, so index becomes the radix. parseInt(1, 0) is 1, parseInt(2, 1) is NaN and parseInt(3, 2) is NaN.",
    hint: "parseInt takes a second argument. What does map pass there?",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Closures",
    question: "What is a closure in JavaScript? Explain with a small example.",
    idealAnswer:
      "A closure is a function that remembers the variables of its outer (lexical) scope even after the outer function has finished running. Example: function counter() { let count = 0; return () => ++count; } const next = counter(); next(); // 1, next(); // 2. The inner function still has access to count.",
    keywords: [
      ["function"],
      ["outer", "parent", "lexical"],
      ["scope", "variable"],
      ["remember", "access", "even after", "still"],
    ],
    explanation:
      "A good answer mentions the inner function, the outer scope variables and that access continues after the outer function returns.",
    hint: "Think about a function returned from another function.",
  },
  {
    format: "practical",
    difficulty: "easy",
    topic: "Arrays",
    question:
      "Write a function that takes an array and returns a new array with duplicate values removed.",
    idealAnswer:
      "const unique = (arr) => [...new Set(arr)];\n\nOr with filter: arr.filter((item, index) => arr.indexOf(item) === index)",
    keywords: [
      ["set", "filter", "indexof", "includes", "reduce"],
      ["return", "=>"],
    ],
    explanation:
      "Set stores only unique values, so spreading a Set gives an array without duplicates. filter with indexOf also works but is slower on big arrays.",
    hint: "There is a built-in collection that only keeps unique values.",
  },
];
