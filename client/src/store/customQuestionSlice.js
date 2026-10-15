import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const messageOf = (error) =>
  error.response?.data?.message || "Cannot reach the server";

export const fetchCustomQuestions = createAsyncThunk(
  "customQuestions/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/custom-questions");
      return data.questions;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const createCustomQuestion = createAsyncThunk(
  "customQuestions/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/custom-questions", payload);
      return data.question;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const importCustomQuestions = createAsyncThunk(
  "customQuestions/import",
  async (entries) => {
    const saved = [];

    for (const { id, payload } of entries) {
      try {
        const { data } = await api.post("/custom-questions", payload);

        saved.push({ id, question: data.question });
      } catch (error) {
        return { saved, failed: { id, message: messageOf(error) } };
      }
    }

    return { saved, failed: null };
  },
);

export const deleteCustomQuestion = createAsyncThunk(
  "customQuestions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/custom-questions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

const initialState = {
  items: [],
  loaded: false,
  error: null,
  busy: false,
  actionError: null,
};

const customQuestionSlice = createSlice({
  name: "customQuestions",
  initialState,
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomQuestions.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCustomQuestions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loaded = true;
      })
      .addCase(fetchCustomQuestions.rejected, (state, action) => {
        state.error = action.payload ?? "Something went wrong";
      })
      .addCase(createCustomQuestion.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(importCustomQuestions.fulfilled, (state, action) => {
        action.payload.saved.forEach(({ question }) => {
          state.items.unshift(question);
        });
      })
      .addCase(deleteCustomQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        isAnyOf(
          createCustomQuestion.pending,
          importCustomQuestions.pending,
          deleteCustomQuestion.pending,
        ),
        (state) => {
          state.busy = true;
          state.actionError = null;
        },
      )
      .addMatcher(
        isAnyOf(
          createCustomQuestion.fulfilled,
          importCustomQuestions.fulfilled,
          deleteCustomQuestion.fulfilled,
        ),
        (state) => {
          state.busy = false;
        },
      )
      .addMatcher(
        isAnyOf(
          createCustomQuestion.rejected,
          importCustomQuestions.rejected,
          deleteCustomQuestion.rejected,
        ),
        (state, action) => {
          state.busy = false;
          state.actionError = action.payload ?? "Something went wrong";
        },
      );
  },
});

export const { clearActionError } = customQuestionSlice.actions;
export default customQuestionSlice.reducer;
