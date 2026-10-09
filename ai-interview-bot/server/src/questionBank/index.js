import { dsa } from "./dsa.js";
import { express } from "./express.js";
import { generateAptitude } from "./generators/aptitude.js";
import { generateReasoning } from "./generators/reasoning.js";
import { hr } from "./hr.js";
import { htmlCss } from "./htmlCss.js";
import { javascript } from "./javascript.js";
import { mongodb } from "./mongodb.js";
import { nodejs } from "./nodejs.js";
import { react } from "./react.js";

export const QUESTION_BANK = {
  dsa,
  javascript,
  react,
  "html-css": htmlCss,
  frontend: [...javascript, ...react, ...htmlCss],
  nodejs,
  express,
  mongodb,
  backend: [...nodejs, ...express, ...mongodb],
  hr,
};

export const GENERATORS = {
  aptitude: generateAptitude,
  reasoning: generateReasoning,
};
