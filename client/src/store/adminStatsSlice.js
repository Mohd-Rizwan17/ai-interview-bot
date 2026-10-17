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

const initialState = {
  data: null,
  status: "idle",
  error: null,
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
      });
  },
});

export default adminStatsSlice.reducer;
