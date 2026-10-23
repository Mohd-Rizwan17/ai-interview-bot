import {
  ChevronDown,
  ChevronRight,
  File,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import ConfirmModal from "../../../components/ConfirmModal.jsx";
import { buildTree, isInside, normalizePath, parentPath } from "../fileTree.js";
import {
  clearTreeError,
  createFile,
  createFolder,
  deleteEntry,
  openFile,
  renameEntry,
} from "../miniProjectSlice.js";

const labelFor = (draft) => {
  if (draft.mode === "rename") return `Rename ${draft.from}`;

  return draft.mode === "file"
    ? "New file (example: src/app.js)"
    : "New folder name";
};

const buildAction = (draft) => {
  if (draft.mode === "file") return createFile(draft.value);
  if (draft.mode === "folder") return createFolder(draft.value);

  return renameEntry({ from: draft.from, to: draft.value });
};

const FileTree = ({ disabled }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const { files, folders, activePath, treeError } = useSelector(
    (state) => state.miniProject,
  );
  const [draft, setDraft] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [deleting, setDeleting] = useState(null);
  const nodes = buildTree(files, folders);

  const startDraft = (mode, from = null) => {
    dispatch(clearTreeError());
    setDraft({
      mode,
      from,
      value: from ?? (selectedFolder ? `${selectedFolder}/` : ""),
    });
  };

  const closeDraft = () => {
    dispatch(clearTreeError());
    setDraft(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(buildAction(draft));

    if (store.getState().miniProject.treeError) return;

    const path = normalizePath(draft.value);

    setSelectedFolder(draft.mode === "folder" ? path : parentPath(path));
    setDraft(null);
  };

  const handleSelect = (node) => {
    if (node.type === "file") {
      setSelectedFolder(parentPath(node.path));
      dispatch(openFile(node.path));
      return;
    }

    setSelectedFolder(node.path);
    setCollapsed((current) => {
      const next = new Set(current);

      if (next.has(node.path)) next.delete(node.path);
      else next.add(node.path);

      return next;
    });
  };

   const handleDelete = (node) => setDeleting(node);

   const confirmDelete = () => {
     dispatch(deleteEntry(deleting.path));
     setSelectedFolder("");
     setDeleting(null);
   };

   const deleteMessage = (node) => {
     if (node.type !== "folder") {
       return "This file will be removed from your project.";
     }

     const count = files.filter((file) =>
       isInside(file.path, node.path),
     ).length;

     return `This folder and its ${count} file${count === 1 ? "" : "s"} will be removed.`;
   };

  const renderNodes = (list, depth) =>
    list.map((node) => {
      const isFolder = node.type === "folder";
      const isOpen = !collapsed.has(node.path);
      const FolderIcon = isOpen ? FolderOpen : Folder;
      const Chevron = isOpen ? ChevronDown : ChevronRight;

      return (
        <li key={node.path}>
          <div
            className={`group flex items-center pr-2 text-sm ${
              node.path === activePath ? "bg-accent/15" : "hover:bg-white/5"
            }`}
            style={{ paddingLeft: depth * 12 + 8 }}
          >
            <button
              type="button"
              onClick={() => handleSelect(node)}
              className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left"
            >
              {isFolder ? (
                <Chevron size={14} className="shrink-0" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              {isFolder ? (
                <FolderIcon size={15} className="shrink-0 text-accent" />
              ) : (
                <File size={15} className="shrink-0 text-muted" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {!disabled && (
              <span className="flex shrink-0 gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100">
                <button
                  type="button"
                  aria-label={`Rename ${node.name}`}
                  onClick={() => startDraft("rename", node.path)}
                  className="text-muted hover:text-ink"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${node.name}`}
                  onClick={() => handleDelete(node)}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            )}
          </div>
          {isFolder && isOpen && (
            <ul>{renderNodes(node.children, depth + 1)}</ul>
          )}
        </li>
      );
    });

  return (
    <aside className="flex max-h-60 w-full shrink-0 flex-col border-b border-line bg-(--panel-solid) lg:max-h-none lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Explorer
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="New file"
            title="New file"
            disabled={disabled}
            onClick={() => startDraft("file")}
            className="text-muted hover:text-ink disabled:opacity-40"
          >
            <FilePlus size={16} />
          </button>
          <button
            type="button"
            aria-label="New folder"
            title="New folder"
            disabled={disabled}
            onClick={() => startDraft("folder")}
            className="text-muted hover:text-ink disabled:opacity-40"
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>

      {draft && (
        <form
          onSubmit={handleSubmit}
          className="border-b border-line px-3 pb-2"
        >
          <label htmlFor="tree-draft" className="block text-xs text-muted">
            {labelFor(draft)}
          </label>
          <input
            id="tree-draft"
            autoFocus
            spellCheck={false}
            value={draft.value}
            onChange={(event) =>
              setDraft({ ...draft, value: event.target.value })
            }
            onFocus={(event) => {
              const end = event.target.value.length;

              event.target.setSelectionRange(end, end);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeDraft();
            }}
            className="mt-1 w-full rounded border border-line bg-ground px-2 py-1 font-mono text-sm outline-none focus:border-accent"
          />
        </form>
      )}

      {treeError && (
        <p role="alert" className="px-3 py-2 text-xs text-danger">
          {treeError}
        </p>
      )}

      {nodes.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted">No files yet.</p>
      ) : (
        <ul className="flex-1 overflow-y-auto pb-2">{renderNodes(nodes, 0)}</ul>
      )}
      {deleting && (
        <ConfirmModal
          title={`Delete "${deleting.path}"?`}
          message={deleteMessage(deleting)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </aside>
  );
};

export default FileTree;
