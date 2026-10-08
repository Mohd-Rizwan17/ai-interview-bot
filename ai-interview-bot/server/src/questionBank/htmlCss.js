export const htmlCss = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "HTML",
    question: "Which HTML tag is used for the largest heading?",
    options: ["<h6>", "<h1>", "<head>", "<header>"],
    correctOption: 1,
    explanation:
      "Headings go from <h1> (largest) to <h6> (smallest). <head> and <header> are not headings.",
    hint: "Heading numbers start from the biggest one.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "CSS",
    question: "Which CSS property changes the color of text?",
    options: ["font-color", "text-color", "color", "fg-color"],
    correctOption: 2,
    explanation:
      "The color property sets the text color. background-color is used for the background.",
    hint: "It is the shortest and simplest name.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Flexbox",
    question: "What does display: flex do to an element?",
    options: [
      "Hides its children",
      "Makes it a flex container so its children can be laid out in a row or column",
      "Makes it float to the left",
      "Makes it position: absolute",
    ],
    correctOption: 1,
    explanation:
      "display: flex turns the element into a flex container. Its direct children become flex items that you can align and space with properties like justify-content and align-items.",
    hint: "It changes how the children are arranged, not the element itself.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Box Model",
    question:
      "In the CSS box model, what is the order of the layers from inside to outside?",
    options: [
      "content, padding, border, margin",
      "content, margin, border, padding",
      "padding, content, border, margin",
      "border, content, padding, margin",
    ],
    correctOption: 0,
    explanation:
      "Content is in the middle, then padding, then border, and margin is the space outside the border.",
    hint: "Margin is always the outermost layer.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Specificity",
    question: "Which selector has the highest specificity?",
    options: ["p", "div p", ".card", "#card"],
    correctOption: 3,
    explanation:
      "An id selector (#card) beats a class selector (.card), which beats element selectors (p, div p).",
    hint: "Id > class > element.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Positioning",
    question:
      "An element has position: absolute. It is positioned relative to which element?",
    options: [
      "The viewport, always",
      "Its nearest ancestor that has a position other than static",
      "Its parent, always",
      "The body, always",
    ],
    correctOption: 1,
    explanation:
      "An absolute element looks for the nearest positioned ancestor (relative, absolute, fixed or sticky). If none exists, it uses the initial containing block, which is the page itself.",
    hint: "That is why we often add position: relative on the parent.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Display",
    question:
      "What is the difference between block, inline and inline-block elements?",
    idealAnswer:
      "A block element starts on a new line and takes the full available width, and you can set its width and height. An inline element stays in the same line, is only as wide as its content, and ignores width and height. An inline-block element stays in the same line like inline, but you can set its width and height like a block.",
    keywords: [
      ["block", "new line", "full width"],
      ["inline", "same line", "content"],
      ["inline-block"],
      ["width", "height"],
    ],
    explanation:
      "A good answer covers all three types and mentions that width and height work on block and inline-block but not on inline.",
    hint: "Compare them on two points: new line or same line, and width/height allowed or not.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "Flexbox",
    question:
      "Write CSS to center a child element horizontally and vertically inside its parent using flexbox.",
    idealAnswer: `.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`,
    keywords: [
      ["display: flex", "display:flex"],
      ["justify-content"],
      ["align-items"],
      ["center"],
    ],
    explanation:
      "The parent becomes a flex container. justify-content centers on the main axis (horizontal), align-items centers on the cross axis (vertical). The parent also needs a height for vertical centering to be visible.",
    hint: "You need three properties on the parent.",
  },
];
