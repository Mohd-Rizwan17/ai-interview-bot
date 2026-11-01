import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const toRejection = (error) => {
  const data = error.response?.data;

  return {
    message: data?.message || "Cannot reach the server",
    code: data?.code,
    device: data?.device,
    confirmToken: data?.confirmToken,
  };
};

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.user;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data.user;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      return data.user;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const confirmLogin = createAsyncThunk(
  "auth/confirmLogin",
  async (confirmToken, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login/confirm", { confirmToken });
      return data.user;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/verify-otp", payload);
      return data;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/reset-password", payload);
      return data;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

const initialState = {
  user: null,
  checked: false,
  status: "idle",
  error: null,
  conflict: null,
  sessionEnded: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    cancelConflict: (state) => {
      state.conflict = null;
      state.error = null;
    },
    markSessionEnded: (state) => {
      state.user = null;
      state.checked = true;
      state.sessionEnded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.checked = true;
      })
      .addMatcher(
        isAnyOf(loginUser.pending, registerUser.pending, confirmLogin.pending),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          loginUser.fulfilled,
          registerUser.fulfilled,
          confirmLogin.fulfilled,
        ),
        (state, action) => {
          state.status = "idle";
          state.user = action.payload;
          state.conflict = null;
          state.sessionEnded = false;
        },
      )
      .addMatcher(
        isAnyOf(
          loginUser.rejected,
          registerUser.rejected,
          confirmLogin.rejected,
        ),
        (state, action) => {
          state.status = "idle";

          if (action.payload?.code === "ALREADY_LOGGED_IN") {
            state.conflict = {
              device: action.payload.device,
              confirmToken: action.payload.confirmToken,
            };
            return;
          }

          state.conflict = null;
          state.error = action.payload?.message ?? "Something went wrong";
        },
      )
      .addMatcher(
        isAnyOf(logoutUser.fulfilled, logoutUser.rejected),
        (state) => {
          state.user = null;
        },
      );
  },
});

export const { cancelConflict, clearAuthError, markSessionEnded } =
  authSlice.actions;

export default authSlice.reducer;
