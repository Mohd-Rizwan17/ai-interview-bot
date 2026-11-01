import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const fetchStats = createAsyncThunk(
  "stats/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/stats/me");
      return data.stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Cannot reach the server",
      );
    }
  },
);

const initialState = {
  data: null,
  status: "idle",
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default statsSlice.reducer;
