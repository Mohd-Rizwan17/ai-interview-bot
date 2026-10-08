import { express } from "./express.js";
import { htmlCss } from "./htmlCss.js";
import { javascript } from "./javascript.js";
import { mongodb } from "./mongodb.js";
import { nodejs } from "./nodejs.js";
import { react } from "./react.js";

export const QUESTION_BANK = {
  javascript,
  react,
  "html-css": htmlCss,
  frontend: [...javascript, ...react, ...htmlCss],
  nodejs,
  express,
  mongodb,
  backend: [...nodejs, ...express, ...mongodb],
};
