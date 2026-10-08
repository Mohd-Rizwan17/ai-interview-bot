export const dsa = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Complexity",
    question:
      "What is the time complexity of reading an array element by its index, like arr[5]?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctOption: 0,
    explanation:
      "Array elements sit in continuous memory, so the position is calculated directly. The time does not depend on the array size, so it is O(1).",
    hint: "The position is calculated, not searched.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Stack",
    question:
      "Which data structure follows the LIFO (last in, first out) rule?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correctOption: 1,
    explanation:
      "In a stack the last item pushed is the first item popped, like a pile of plates. A queue is FIFO.",
    hint: "Think of a pile of plates.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Searching",
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctOption: 1,
    explanation:
      "Binary search cuts the search range in half at every step, so for n elements it needs about log n steps. The array must be sorted.",
    hint: "The search range becomes half at each step.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Hash Table",
    question:
      "What is the average time complexity of looking up a key in a hash table (like a JavaScript Map)?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctOption: 0,
    explanation:
      "A hash function turns the key into a position, so the lookup does not scan the data. In the worst case, with many collisions, it can become O(n).",
    hint: "The key is turned directly into a position.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Complexity",
    question:
      "A function has a loop that runs n times, and inside it another loop that also runs n times. What is the time complexity?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(2n)"],
    correctOption: 1,
    explanation:
      "The inner loop runs n times for each of the n outer iterations, so the work is n × n = n². Note that O(2n) is the same as O(n), not n².",
    hint: "Multiply the two loops, do not add them.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Arrays",
    question:
      "What is the time complexity of adding an element at the start of a JavaScript array using unshift()?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctOption: 1,
    explanation:
      "Every existing element has to move one position to the right to make space at the start, so the work grows with the array size: O(n). push() at the end is O(1).",
    hint: "What happens to all the other elements?",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Graphs",
    question:
      "Which data structure is normally used to implement BFS (breadth-first search)?",
    options: ["Stack", "Queue", "Heap", "Hash table"],
    correctOption: 1,
    explanation:
      "BFS visits nodes level by level, so the first node discovered must be processed first. That is FIFO order, which a queue gives. DFS uses a stack (or recursion).",
    hint: "Level by level means first come, first served.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Sorting",
    question:
      "Which of these sorting algorithms is O(n log n) even in the worst case?",
    options: ["Bubble sort", "Quick sort", "Merge sort", "Insertion sort"],
    correctOption: 2,
    explanation:
      "Merge sort always splits the array in half and merges, so it is O(n log n) in every case. Quick sort is O(n log n) on average but O(n²) in the worst case. Bubble and insertion sort are O(n²).",
    hint: "One of them has no bad worst case, because it always splits evenly.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Complexity",
    question: "What is Big O notation and why do we use it?",
    idealAnswer:
      "Big O notation describes how the running time or memory of an algorithm grows as the input size n grows. It looks at the worst-case growth and ignores constants and small terms. We use it to compare algorithms and to know how they will perform when the input becomes large, without depending on a specific computer. For example, a single loop over n items is O(n) and a nested loop is O(n²).",
    keywords: [
      ["grow", "growth", "rate"],
      ["input size", "size of input", "n items", "input"],
      ["worst case", "worst-case", "upper bound", "worst"],
      ["compare", "efficiency", "performance", "scale"],
    ],
    explanation:
      "A good answer says Big O shows how time or space grows with input size, and that it is used to compare algorithms.",
    hint: "It is about growth, not about exact seconds.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Linked List",
    question: "What is the difference between an array and a linked list?",
    idealAnswer:
      "An array stores elements in continuous memory, so any element can be read by its index in O(1). Inserting or deleting in the middle is slow, O(n), because the other elements must be shifted. A linked list stores nodes, and each node holds a value and a pointer to the next node. Inserting or deleting is fast once you have the node, but reading the nth element needs a walk from the head, which is O(n).",
    keywords: [
      ["index", "random access", "direct access"],
      ["insert", "delete", "shift", "middle"],
      ["node", "pointer", "next", "reference"],
      ["continuous", "contiguous", "memory"],
    ],
    explanation:
      "A good answer compares reading by index, insert and delete cost, and how the data sits in memory.",
    hint: "Compare them on two actions: reading the nth item and inserting in the middle.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "Hash Table",
    question:
      "Write a function twoSum(nums, target) that returns the indices of the two numbers that add up to target. Aim for O(n) time.",
    idealAnswer: `const twoSum = (nums, target) => {
  const seen = new Map();

  for (let i = 0; i < nums.length; i += 1) {
    const needed = target - nums[i];

    if (seen.has(needed)) return [seen.get(needed), i];

    seen.set(nums[i], i);
  }

  return [];
};`,
    keywords: [
      ["map", "object", "set(", "{}"],
      ["target -", "target-"],
      ["for", "while", "foreach"],
      ["return"],
    ],
    explanation:
      "We store each number with its index in a Map. For every number we check if target minus that number was already seen. One pass, so it is O(n) instead of O(n²).",
    hint: "For each number, ask: have I already seen the number I need?",
  },
  {
    format: "practical",
    difficulty: "easy",
    topic: "Strings",
    question:
      "Write a function isPalindrome(text) that returns true if the text reads the same forward and backward. Ignore uppercase and lowercase.",
    idealAnswer: `const isPalindrome = (text) => {
  const clean = text.toLowerCase();

  return clean === [...clean].reverse().join("");
};`,
    keywords: [
      ["tolowercase", "lowercase", "touppercase"],
      ["reverse", "left", "right", "two pointer", "start", "end"],
      ["return"],
    ],
    explanation:
      "Make the text lowercase, reverse it and compare. A two-pointer loop from both ends also works and uses less memory.",
    hint: "Compare the text with its reversed version.",
  },
  {
    format: "practical",
    difficulty: "hard",
    topic: "Stack",
    question:
      "Write a function isValid(text) for a string that has only the characters ()[]{}. Return true if every bracket is closed in the correct order.",
    idealAnswer: `const isValid = (text) => {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const char of text) {
    if (pairs[char]) {
      if (stack.pop() !== pairs[char]) return false;
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
};`,
    keywords: [["stack", "[]"], ["push"], ["pop"], ["return"]],
    explanation:
      "Push every opening bracket on a stack. For a closing bracket, pop the top and check that it is the matching opening one. At the end the stack must be empty.",
    hint: "The last bracket opened must be the first one closed.",
  },
];
