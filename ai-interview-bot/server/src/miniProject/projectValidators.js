import { body, param } from "express-validator";
import {
  MAX_FILES,
  MAX_FOLDERS,
  MAX_PATH_DEPTH,
  MAX_PATH_LENGTH,
  MAX_PROJECT_BYTES,
} from "./constants.js";

const isValidPath = (value) => {
  if (typeof value !== "string" || value.length > MAX_PATH_LENGTH) {
    return false;
  }

  if (!/^[\w.-]+(\/[\w.-]+)*$/.test(value)) return false;

  const segments = value.split("/");

  return (
    segments.length <= MAX_PATH_DEPTH &&
    segments.every((segment) => segment !== "." && segment !== "..")
  );
};

const isWithinSize = (files) =>
  !Array.isArray(files) ||
  files.reduce(
    (sum, file) => sum + Buffer.byteLength(String(file?.content ?? "")),
    0,
  ) <= MAX_PROJECT_BYTES;

const hasUniquePaths = (files) =>
  !Array.isArray(files) ||
  new Set(files.map((file) => file?.path)).size === files.length;

export const attemptIdRule = [
  param("attemptId").isMongoId().withMessage("Invalid project id"),
];

export const saveFilesRules = [
  body("files")
    .isArray({ max: MAX_FILES })
    .withMessage(`Use at most ${MAX_FILES} files`),
  body("files.*.path").custom(isValidPath).withMessage("Invalid file path"),
  body("files.*.content").isString().withMessage("File content must be text"),
  body("files")
    .custom(hasUniquePaths)
    .withMessage("Two files cannot have the same path"),
  body("files")
    .custom(isWithinSize)
    .withMessage(`Project must be under ${MAX_PROJECT_BYTES / 1024} KB`),
  body("folders")
    .optional()
    .isArray({ max: MAX_FOLDERS })
    .withMessage(`Use at most ${MAX_FOLDERS} folders`),
  body("folders.*").custom(isValidPath).withMessage("Invalid folder path"),
];
