import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const messageOf = (error) =>
  error.response?.data?.message || "Cannot reach the server";

export const fetchHistory = createAsyncThunk(
  "history/fetch",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/interviews", {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const fetchActiveInterview = createAsyncThunk(
  "history/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/interviews", {
        params: { page: 1, limit: 1 },
      });
      const [latest] = data.interviews;

      return latest?.status === "in_progress" ? latest : null;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

const initialState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  loaded: false,
  status: "idle",
  error: null,
  active: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = "idle";
        state.loaded = true;
        state.items = action.payload.interviews;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Something went wrong";
      })
      .addCase(fetchActiveInterview.pending, (state) => {
        state.active = null;
      })
      .addCase(fetchActiveInterview.fulfilled, (state, action) => {
        state.active = action.payload;
      });
  },
});

export default historySlice.reducer;
