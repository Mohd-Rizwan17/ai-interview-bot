import { dsa } from "./dsa.js";
import { express } from "./express.js";
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
