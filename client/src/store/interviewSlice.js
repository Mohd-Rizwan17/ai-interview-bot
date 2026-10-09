import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const startInterview = createAsyncThunk(
  "interview/start",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/interviews", payload);
      return data.interview;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Cannot reach the server",
      );
    }
  },
);

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    status: "idle",
    error: null,
  },
  reducers: {
    clearInterviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startInterview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(startInterview.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(startInterview.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearInterviewError } = interviewSlice.actions;

export default interviewSlice.reducer;
