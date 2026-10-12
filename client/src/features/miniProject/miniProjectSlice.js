import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import { getProjectWork, putProjectFiles } from "./api.js";
import * as tree from "./fileTree.js";

const toRejection = (error) => ({
  message: error.response?.data?.message || "Cannot reach the server",
  code: error.response?.data?.code,
});

export const loadProject = createAsyncThunk(
  "miniProject/load",
  async (attemptId, { rejectWithValue }) => {
    try {
      return await getProjectWork(attemptId);
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const saveProject = createAsyncThunk(
  "miniProject/save",
  async (_, { getState, rejectWithValue }) => {
    const { attemptId, files, folders, editVersion } = getState().miniProject;

    try {
      const data = await putProjectFiles(attemptId, { files, folders });

      return { savedAt: data.savedAt, version: editVersion };
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().miniProject.saveStatus !== "saving",
  },
);

const FLUSH_MAX_TRIES = 5;

const FLUSH_WAIT_MS = 300;

export const flushProject = createAsyncThunk(
  "miniProject/flush",
  async (_, { dispatch, getState }) => {
    for (let tries = 0; tries < FLUSH_MAX_TRIES; tries += 1) {
      const { saveStatus } = getState().miniProject;

      if (saveStatus === "saved") break;

      if (saveStatus === "saving") {
        await new Promise((resolve) => setTimeout(resolve, FLUSH_WAIT_MS));
      } else {
        await dispatch(saveProject());
      }
    }

    return getState().miniProject.saveStatus === "saved";
  },
);

const initialState = {
  attemptId: null,
  status: "idle",
  error: null,
  stack: null,
  project: null,
  files: [],
  folders: [],
  openTabs: [],
  activePath: null,
  treeError: null,
  editVersion: 0,
  saveStatus: "saved",
  saveError: null,
  savedAt: null,
  ended: false,
};

const markEdited = (state) => {
  state.editVersion += 1;

  if (state.saveStatus !== "saving") state.saveStatus = "dirty";
};

const syncTabs = (state) => {
  const existing = new Set(state.files.map((file) => file.path));

  state.openTabs = state.openTabs.filter((path) => existing.has(path));

  if (!state.openTabs.includes(state.activePath)) {
    state.activePath = state.openTabs.at(-1) ?? null;
  }
};

const applyTreeChange = (state, change) => {
  try {
    const result = change({
      files: current(state.files),
      folders: current(state.folders),
    });

    state.files = result.files;
    state.folders = result.folders;
    state.treeError = null;
    markEdited(state);

    return result;
  } catch (error) {
    if (!(error instanceof tree.TreeError)) throw error;

    state.treeError = error.message;

    return null;
  }
};

const miniProjectSlice = createSlice({
  name: "miniProject",
  initialState,
  reducers: {
    resetProject: () => initialState,
    openFile: (state, action) => {
      const path = action.payload;

      if (!state.files.some((file) => file.path === path)) return;

      if (!state.openTabs.includes(path)) state.openTabs.push(path);

      state.activePath = path;
    },
    closeTab: (state, action) => {
      state.openTabs = state.openTabs.filter((path) => path !== action.payload);
      syncTabs(state);
    },
    updateContent: (state, action) => {
      const { path, content } = action.payload;
      const file = state.files.find((item) => item.path === path);

      if (!file || file.content === content) return;

      file.content = content;
      markEdited(state);
    },
    createFile: (state, action) => {
      const result = applyTreeChange(state, (snapshot) =>
        tree.addFile(snapshot, action.payload),
      );

      if (!result) return;

      state.openTabs.push(result.path);
      state.activePath = result.path;
    },
    createFolder: (state, action) => {
      applyTreeChange(state, (snapshot) =>
        tree.addFolder(snapshot, action.payload),
      );
    },
    renameEntry: (state, action) => {
      const { from, to } = action.payload;
      const result = applyTreeChange(state, (snapshot) =>
        tree.renameEntry(snapshot, from, to),
      );

      if (!result) return;

      state.openTabs = state.openTabs.map((path) =>
        tree.rebase(path, from, result.path),
      );
      state.activePath =
        state.activePath && tree.rebase(state.activePath, from, result.path);
      syncTabs(state);
    },
    deleteEntry: (state, action) => {
      const result = applyTreeChange(state, (snapshot) =>
        tree.deleteEntry(snapshot, action.payload),
      );

      if (result) syncTabs(state);
    },
    clearTreeError: (state) => {
      state.treeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProject.pending, (_state, action) => ({
        ...initialState,
        status: "loading",
        attemptId: action.meta.arg,
      }))
      .addCase(loadProject.fulfilled, (state, action) => {
        const { stack, project, files, folders } = action.payload;
        const first =
          files.find((file) => file.path === "index.html") ?? files[0];

        state.status = "ready";
        state.stack = stack;
        state.project = project;
        state.files = files;
        state.folders = folders;
        state.openTabs = first ? [first.path] : [];
        state.activePath = first?.path ?? null;
      })
      .addCase(loadProject.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload?.message ?? "Something went wrong";
      })
      .addCase(saveProject.pending, (state) => {
        state.saveStatus = "saving";
        state.saveError = null;
      })
      .addCase(saveProject.fulfilled, (state, action) => {
        state.savedAt = action.payload.savedAt;
        state.saveStatus =
          state.editVersion === action.payload.version ? "saved" : "dirty";
      })
      .addCase(saveProject.rejected, (state, action) => {
        state.saveStatus = "error";
        state.saveError = action.payload?.message ?? "Something went wrong";

        if (action.payload?.code === "INTERVIEW_ENDED") state.ended = true;
      });
  },
});

export const {
  resetProject,
  openFile,
  closeTab,
  updateContent,
  createFile,
  createFolder,
  renameEntry,
  deleteEntry,
  clearTreeError,
} = miniProjectSlice.actions;

export default miniProjectSlice.reducer;
