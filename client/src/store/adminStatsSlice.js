import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const fetchAdminStats = createAsyncThunk(
  "adminStats/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/stats/admin");
      return data.stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Cannot reach the server",
      );
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  "adminStats/fetchLeaderboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/stats/leaderboard");
      return data.leaderboard;
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
  leaderboard: {
    items: [],
    status: "idle",
    error: null,
  },
};

const adminStatsSlice = createSlice({
  name: "adminStats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Something went wrong";
      })
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboard.status = "loading";
        state.leaderboard.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.status = "idle";
        state.leaderboard.items = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboard.status = "idle";
        state.leaderboard.error = action.payload ?? "Something went wrong";
      });
  },
});

export default adminStatsSlice.reducer;
