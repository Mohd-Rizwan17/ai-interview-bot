export const express = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Middleware",
    question: "What is middleware in Express?",
    options: [
      "A function that runs between the request and the response and can use req, res and next",
      "A database driver",
      "A template engine",
      "A CSS file served by the server",
    ],
    correctOption: 0,
    explanation:
      "Middleware is a function with access to req, res and next. It can read or change the request, end the response, or pass control to the next function with next().",
    hint: "It sits in the middle of the request-response cycle.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Request Body",
    question: "Which line lets Express read a JSON request body?",
    options: [
      "app.use(express.json())",
      "app.use(express.body())",
      "app.parse(json)",
      "req.parse()",
    ],
    correctOption: 0,
    explanation:
      "express.json() is a built-in middleware that parses a JSON body and puts the result in req.body.",
    hint: "The name of the middleware matches the format of the data.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Status Codes",
    question:
      "Which status code is the best response after a new resource is created successfully?",
    options: ["200", "201", "204", "301"],
    correctOption: 1,
    explanation:
      "201 Created means a new resource was created. 200 is a general success, 204 means success with no content, and 301 is a redirect.",
    hint: "It is the 'Created' code.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Routing",
    question:
      "The route is /users/:id and the request is /users/42?sort=asc. Where do you read 42?",
    options: ["req.query.id", "req.params.id", "req.body.id", "req.headers.id"],
    correctOption: 1,
    explanation:
      "Route parameters like :id are in req.params. The part after ? (sort=asc) is in req.query, and the JSON data sent by the client is in req.body.",
    hint: "The value is part of the path itself, not after the question mark.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Middleware",
    question:
      "A middleware neither calls next() nor sends a response. What happens to the request?",
    options: [
      "It goes to the next route automatically",
      "It hangs until the client times out",
      "Express sends a 404",
      "The server crashes",
    ],
    correctOption: 1,
    explanation:
      "Express waits for the middleware to either end the response or call next(). If neither happens, the request stays open until the client gives up.",
    hint: "Nobody tells Express what to do next.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Error Handling",
    question: "How does Express recognize an error-handling middleware?",
    options: [
      "It is registered with app.catch()",
      "It is a function with four parameters: (err, req, res, next)",
      "It is a function with three parameters: (req, res, next)",
      "Its name must be errorHandler",
    ],
    correctOption: 1,
    explanation:
      "Express checks the number of parameters. A function with four parameters is treated as an error handler, and it must be registered after the routes.",
    hint: "Count the parameters.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Error Handling",
    question:
      "In Express 5, what happens when an async route handler returns a rejected promise?",
    options: [
      "The server always crashes",
      "The error is passed to the error-handling middleware automatically",
      "The request hangs forever",
      "The error is ignored",
    ],
    correctOption: 1,
    explanation:
      "Express 5 forwards rejected promises and thrown errors from handlers to the error handler, so you no longer need a try/catch or wrapper in every async route. Express 4 did not do this.",
    hint: "This is one of the big improvements of Express 5.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "CORS",
    question: "What is CORS and what problem does it solve?",
    idealAnswer:
      "CORS stands for Cross-Origin Resource Sharing. By default the browser blocks a web page from calling an API on a different origin (different domain, port or protocol) because of the same-origin policy. With CORS the server sends response headers like Access-Control-Allow-Origin that tell the browser which origins are allowed to access it. In Express we usually use the cors package for this.",
    keywords: [
      ["browser"],
      ["origin", "domain", "port"],
      ["block", "same-origin", "same origin", "different"],
      ["header", "allow", "allowed"],
    ],
    explanation:
      "A good answer says the browser blocks cross-origin requests by default and the server allows chosen origins through response headers.",
    hint: "Think about a React app on port 5173 calling an API on port 5000.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "Routing",
    question:
      "Write an Express server (ES Modules) with a GET /health route that returns the JSON { success: true }, listening on port 5000.",
    idealAnswer: `import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});`,
    keywords: [
      ["express()"],
      ["app.get", ".get("],
      ["res.json", "res.send"],
      ["listen"],
    ],
    explanation:
      "We create the app with express(), register the GET route, send the JSON with res.json and start the server with app.listen.",
    hint: "Four pieces: create the app, add the route, send JSON, listen on a port.",
  },
];
