import { createSlice } from "@reduxjs/toolkit";
import {
  createCustomQuestion,
  deleteCustomQuestion,
  importCustomQuestions,
} from "./customQuestionSlice.js";
import {
  clearHistory,
  deleteInterview,
  updateRetention,
} from "./historySlice.js";

const MAX_TOASTS = 3;

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const add = (state, message, tone = "success") => {
  state.nextId += 1;
  state.items = [...state.items, { id: state.nextId, message, tone }].slice(
    -MAX_TOASTS,
  );
};

const initialState = {
  items: [],
  nextId: 0,
};

const toastSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    pushToast: (state, action) => {
      add(state, action.payload.message, action.payload.tone);
    },
    dismissToast: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCustomQuestion.fulfilled, (state) => {
        add(state, "Question saved");
      })
      .addCase(importCustomQuestions.fulfilled, (state, action) => {
        const { saved, failed } = action.payload;

        if (!failed && saved.length > 0) {
          add(state, `${plural(saved.length, "question")} saved`);
        }
      })
      .addCase(deleteCustomQuestion.fulfilled, (state) => {
        add(state, "Question deleted");
      })
      .addCase(deleteInterview.fulfilled, (state) => {
        add(state, "Interview deleted");
      })
      .addCase(clearHistory.fulfilled, (state, action) => {
        add(state, `${plural(action.payload, "interview")} deleted`);
      })
      .addCase(updateRetention.fulfilled, (state, action) => {
        add(state, `Auto-delete set to ${action.payload.retentionDays} days`);
      });
  },
});

export const { pushToast, dismissToast } = toastSlice.actions;

export default toastSlice.reducer;
