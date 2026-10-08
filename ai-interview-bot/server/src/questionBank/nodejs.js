export const nodejs = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Basics",
    question: "What is Node.js?",
    options: [
      "A JavaScript framework for building user interfaces",
      "A JavaScript runtime built on the V8 engine that runs JavaScript outside the browser",
      "A database for storing JSON",
      "A CSS preprocessor",
    ],
    correctOption: 1,
    explanation:
      "Node.js is a runtime, not a framework or a language. It uses Chrome's V8 engine so JavaScript can run on a server or on your computer.",
    hint: "It lets JavaScript run outside the browser.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "npm",
    question:
      "Which command creates a package.json file with default values, without asking questions?",
    options: ["npm start", "npm init -y", "npm install -y", "node init"],
    correctOption: 1,
    explanation:
      "npm init -y creates package.json with default answers. Plain npm init asks you each question one by one.",
    hint: "The -y flag means 'yes to everything'.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Modules",
    question:
      "Which built-in module helps you build file paths that work on every operating system?",
    options: ["fs", "path", "os", "http"],
    correctOption: 1,
    explanation:
      "The path module joins and resolves paths using the correct separator for the system, for example path.join('a', 'b').",
    hint: "The answer is the name of what you are building.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Modules",
    question:
      'package.json has "type": "module". Which line is the correct way to load a package?',
    options: [
      'const express = require("express")',
      'import express from "express"',
      'include express from "express"',
      'use express from "express"',
    ],
    correctOption: 1,
    explanation:
      "With type module your files are ES Modules, so you use import and export. require is only available in CommonJS files.",
    hint: "It is the same syntax React projects use.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Event Loop",
    question: "Which of these blocks the Node.js event loop?",
    options: [
      "fs.readFile() with a callback",
      "await fetch(url)",
      "A synchronous loop that runs a billion times",
      "setTimeout(fn, 1000)",
    ],
    correctOption: 2,
    explanation:
      "Node runs your JavaScript on a single thread. A long synchronous loop keeps that thread busy, so no other request can be handled until it finishes. The other options are asynchronous and let the thread continue.",
    hint: "Three options wait without holding the thread. One does not.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Event Loop",
    question:
      'What is the output order of: setTimeout(() => console.log("a"), 0); process.nextTick(() => console.log("b"));',
    options: ["a then b", "b then a", "Only a", "Only b"],
    correctOption: 1,
    explanation:
      "process.nextTick callbacks run right after the current operation finishes, before the event loop moves on to timers. So b prints first, then a.",
    hint: "nextTick has its own queue that runs before timers.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Event Loop",
    question: "What is the event loop in Node.js? Explain in simple words.",
    idealAnswer:
      "Node.js runs JavaScript on a single thread. The event loop is the mechanism that keeps checking whether the call stack is empty. When it is empty, the loop picks the next ready callback from the queue and runs it. Slow work like file reads or network calls is handed off, and its callback is added to the queue when it finishes. This is how Node stays non-blocking and handles many requests with one thread.",
    keywords: [
      ["single", "one thread"],
      ["callback", "queue", "task"],
      ["non-blocking", "non blocking", "asynchronous", "async"],
      ["call stack", "stack", "empty", "free"],
    ],
    explanation:
      "A good answer says Node is single-threaded, the loop moves callbacks from the queue to the stack when it is free, and this keeps I/O non-blocking.",
    hint: "Think of a waiter who takes many orders but cooks nothing himself.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Async",
    question:
      "Why is it a bad idea to use fs.readFileSync inside a request handler of a server?",
    idealAnswer:
      "readFileSync is synchronous, so it blocks the event loop until the file is fully read. While it runs, the server cannot handle any other request, so every user waits and the app becomes slow under load. Use the asynchronous version, fs.promises.readFile with await, so the event loop stays free for other requests.",
    keywords: [
      ["block", "blocks", "blocking"],
      ["event loop", "single thread", "one thread"],
      ["other request", "other users", "all users", "everyone", "wait"],
      ["async", "await", "promise", "callback", "readfile("],
    ],
    explanation:
      "A good answer says the call blocks the single thread, so other requests wait, and suggests the async readFile with await.",
    hint: "Think about what happens to the second user while the first file is being read.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "File System",
    question:
      "Write a Node.js script (ES Modules) that reads a file named data.txt using fs/promises and prints its content. Handle the error if the file is missing.",
    idealAnswer: `import { readFile } from "node:fs/promises";

try {
  const content = await readFile("data.txt", "utf-8");
  console.log(content);
} catch (error) {
  console.error("Could not read file:", error.message);
}`,
    keywords: [
      ["readfile"],
      ["fs"],
      ["await", ".then"],
      ["catch"],
      ["console.log"],
    ],
    explanation:
      "readFile from fs/promises returns a promise, so we await it. A try/catch handles the case where the file does not exist.",
    hint: "Import readFile from the promises version of fs, then wrap the call in try/catch.",
  },
];
