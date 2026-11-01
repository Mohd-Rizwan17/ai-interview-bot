import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const messageOf = (error) =>
  error.response?.data?.message || "Cannot reach the server";

export const fetchHistory = createAsyncThunk(
  "history/fetch",
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/interviews", {
        params: { page, limit, search },
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

export const deleteInterview = createAsyncThunk(
  "history/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      await api.delete(`/interviews/${id}`);

      const { items, page, limit, search } = getState().history;
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;

      dispatch(fetchHistory({ page: nextPage, limit, search }));
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const clearHistory = createAsyncThunk(
  "history/clear",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data } = await api.delete("/interviews");
      const { limit, search } = getState().history;

      dispatch(fetchHistory({ page: 1, limit, search }));

      return data.deleted;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const updateRetention = createAsyncThunk(
  "history/updateRetention",
  async (days, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data } = await api.patch("/interviews/retention", { days });

      if (data.deleted > 0) {
        const { limit, search } = getState().history;
        dispatch(fetchHistory({ page: 1, limit, search }));
      }

      return data;
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
  search: "",
  retentionDays: null,
  loaded: false,
  status: "idle",
  error: null,
  busy: false,
  actionError: null,
  active: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
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
        state.retentionDays = action.payload.retentionDays;
        state.search = action.meta.arg.search ?? "";
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
      })
      .addCase(updateRetention.fulfilled, (state, action) => {
        state.retentionDays = action.payload.retentionDays;
      })
      .addMatcher(
        isAnyOf(
          deleteInterview.pending,
          clearHistory.pending,
          updateRetention.pending,
        ),
        (state) => {
          state.busy = true;
          state.actionError = null;
        },
      )
      .addMatcher(
        isAnyOf(
          deleteInterview.fulfilled,
          clearHistory.fulfilled,
          updateRetention.fulfilled,
        ),
        (state) => {
          state.busy = false;
        },
      )
      .addMatcher(
        isAnyOf(
          deleteInterview.rejected,
          clearHistory.rejected,
          updateRetention.rejected,
        ),
        (state, action) => {
          state.busy = false;
          state.actionError = action.payload ?? "Something went wrong";
        },
      );
  },
});

export const { clearActionError } = historySlice.actions;
export default historySlice.reducer;
