import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const fetchReview = createAsyncThunk(
  "review/fetch",
  async (interviewId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/interviews/${interviewId}`);
      return {
        interview: data.interview,
        attempts: data.attempts,
        summary: data.summary,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Cannot reach the server",
      );
    }
  },
);

const initialState = {
  interview: null,
  attempts: [],
  summary: null,
  error: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetReview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReview.fulfilled, (state, action) => {
        state.interview = action.payload.interview;
        state.attempts = action.payload.attempts;
        state.summary = action.payload.summary;
      })
      .addCase(fetchReview.rejected, (state, action) => {
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const { resetReview } = reviewSlice.actions;

export default reviewSlice.reducer;
