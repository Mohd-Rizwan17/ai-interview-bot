import { htmlCss } from "./htmlCss.js";
import { javascript } from "./javascript.js";
import { react } from "./react.js";

export const QUESTION_BANK = {
  javascript,
  react,
  "html-css": htmlCss,
  frontend: [...javascript, ...react, ...htmlCss],
};
