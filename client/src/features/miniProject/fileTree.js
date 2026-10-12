export const MAX_FILES = 50;

export const MAX_FOLDERS = 30;

export const MAX_PATH_LENGTH = 100;

export const MAX_PATH_DEPTH = 5;

const PATH_PATTERN = /^[\w.-]+(\/[\w.-]+)*$/;

export class TreeError extends Error {
  constructor(message) {
    super(message);
    this.name = "TreeError";
  }
}

export const normalizePath = (input) =>
  String(input ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");

export const validatePath = (path) => {
  if (!path) return "Enter a name";

  if (path.length > MAX_PATH_LENGTH) {
    return `Path is too long (max ${MAX_PATH_LENGTH} characters)`;
  }

  if (!PATH_PATTERN.test(path)) {
    return "Use only letters, numbers, dot, dash and underscore";
  }

  const segments = path.split("/");

  if (segments.length > MAX_PATH_DEPTH) {
    return `Folders can be at most ${MAX_PATH_DEPTH} levels deep`;
  }

  if (segments.some((segment) => segment === "." || segment === "..")) {
    return "Names cannot be . or ..";
  }

  return null;
};

const toValidPath = (input) => {
  const path = normalizePath(input);
  const message = validatePath(path);

  if (message) throw new TreeError(message);

  return path;
};

export const isInside = (path, folder) => path.startsWith(`${folder}/`);

export const rebase = (path, from, to) => {
  if (path === from) return to;

  return isInside(path, from) ? `${to}${path.slice(from.length)}` : path;
};

const parentsOf = (path) => {
  const segments = path.split("/").slice(0, -1);

  return segments.map((_, index) => segments.slice(0, index + 1).join("/"));
};

export const allFolders = (files, folders) => {
  const paths = new Set();

  files.forEach((file) => {
    parentsOf(file.path).forEach((parent) => paths.add(parent));
  });

  folders.forEach((folder) => {
    paths.add(folder);
    parentsOf(folder).forEach((parent) => paths.add(parent));
  });

  return paths;
};

const assertFree = (path, files, folders) => {
  const filePaths = new Set(files.map((file) => file.path));

  if (filePaths.has(path) || allFolders(files, folders).has(path)) {
    throw new TreeError(`"${path}" already exists`);
  }

  if (parentsOf(path).some((parent) => filePaths.has(parent))) {
    throw new TreeError("A file cannot contain other files");
  }
};

export const addFile = ({ files, folders }, input) => {
  const path = toValidPath(input);

  if (files.length >= MAX_FILES) {
    throw new TreeError(`You can create at most ${MAX_FILES} files`);
  }

  assertFree(path, files, folders);

  return { files: [...files, { path, content: "" }], folders, path };
};

export const addFolder = ({ files, folders }, input) => {
  const path = toValidPath(input);

  if (folders.length >= MAX_FOLDERS) {
    throw new TreeError(`You can create at most ${MAX_FOLDERS} folders`);
  }

  assertFree(path, files, folders);

  return { files, folders: [...folders, path], path };
};

export const renameEntry = ({ files, folders }, from, input) => {
  const to = toValidPath(input);
  const exists =
    files.some((file) => file.path === from) ||
    allFolders(files, folders).has(from);

  if (!exists) throw new TreeError("Nothing to rename");

  if (to === from) return { files, folders, path: to };

  if (isInside(to, from)) {
    throw new TreeError("A folder cannot be moved into itself");
  }

  assertFree(
    to,
    files.filter((file) => file.path !== from && !isInside(file.path, from)),
    folders.filter((folder) => folder !== from && !isInside(folder, from)),
  );

  const nextFiles = files.map((file) => ({
    ...file,
    path: rebase(file.path, from, to),
  }));
  const nextFolders = folders.map((folder) => rebase(folder, from, to));
  const message = [...nextFiles.map((file) => file.path), ...nextFolders]
    .map(validatePath)
    .find(Boolean);

  if (message) throw new TreeError(message);

  return { files: nextFiles, folders: nextFolders, path: to };
};

export const deleteEntry = ({ files, folders }, path) => ({
  files: files.filter(
    (file) => file.path !== path && !isInside(file.path, path),
  ),
  folders: folders.filter(
    (folder) => folder !== path && !isInside(folder, path),
  ),
});
