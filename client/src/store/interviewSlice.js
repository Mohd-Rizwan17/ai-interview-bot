import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const toRejection = (error) => ({
  message: error.response?.data?.message || "Cannot reach the server",
  code: error.response?.data?.code,
});

export const startInterview = createAsyncThunk(
  "interview/start",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/interviews", payload);
      return data.interview;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const fetchRound = createAsyncThunk(
  "interview/fetchRound",
  async (interviewId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/interviews/${interviewId}/round`);
      const endsAt = Date.now() + data.round.secondsLeft * 1000;

      return { round: { ...data.round, endsAt }, questions: data.questions };
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const submitAnswer = createAsyncThunk(
  "interview/submitAnswer",
  async ({ interviewId, ...answer }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/interviews/${interviewId}/answers`,
        answer,
      );
      return data;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const fetchHint = createAsyncThunk(
  "interview/fetchHint",
  async ({ interviewId, attemptId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/interviews/${interviewId}/hint`, {
        attemptId,
      });
      return data;
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const submitRound = createAsyncThunk(
  "interview/submitRound",
  async ({ interviewId, roundKey, isFinal }, { rejectWithValue }) => {
    const path = isFinal ? "finish" : "round/submit";

    try {
      await api.post(`/interviews/${interviewId}/${path}`, { roundKey });
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

export const reportCheat = createAsyncThunk(
  "interview/reportCheat",
  async (interviewId, { rejectWithValue }) => {
    try {
      await api.post(`/interviews/${interviewId}/cheat`);
    } catch (error) {
      return rejectWithValue(toRejection(error));
    }
  },
);

const initialState = {
  status: "idle",
  error: null,
  round: null,
  questions: [],
  roomError: null,
  roomEnded: false,
  roomFinished: false,
  roomCheated: false,
  answerStatus: "idle",
  answerError: null,
  submitStatus: "idle",
  submitError: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    clearInterviewError: (state) => {
      state.error = null;
    },
    resetRoom: (state) => {
      state.round = null;
      state.questions = [];
      state.roomError = null;
      state.roomEnded = false;
      state.roomFinished = false;
      state.roomCheated = false;
      state.answerStatus = "idle";
      state.answerError = null;
      state.submitStatus = "idle";
      state.submitError = null;
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
        state.error = action.payload?.message ?? "Something went wrong";
      })
      .addCase(fetchRound.pending, (state) => {
        state.roomError = null;
      })
      .addCase(fetchRound.fulfilled, (state, action) => {
        state.round = action.payload.round;
        state.questions = action.payload.questions;
        state.submitError = null;
      })
      .addCase(fetchRound.rejected, (state, action) => {
        if (action.payload?.code === "INTERVIEW_ENDED") {
          state.roomEnded = true;
          return;
        }

        state.roomError = action.payload?.message ?? "Something went wrong";
      })
      .addCase(submitAnswer.pending, (state) => {
        state.answerStatus = "loading";
        state.answerError = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.answerStatus = "idle";

        const { attemptId, selectedOption, answer } = action.meta.arg;
        const question = state.questions.find((item) => item.id === attemptId);

        if (!question) return;

        const isAnswered = action.payload.attempt.status === "answered";

        question.status = action.payload.attempt.status;
        question.selectedOption = isAnswered ? selectedOption : undefined;
        question.userAnswer = isAnswered ? answer?.trim() : undefined;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.answerStatus = "idle";

        if (action.payload?.code === "INTERVIEW_ENDED") {
          state.roomEnded = true;
          return;
        }

        state.answerError = action.payload?.message ?? "Something went wrong";
      })
      .addCase(fetchHint.fulfilled, (state, action) => {
        const question = state.questions.find(
          (item) => item.id === action.meta.arg.attemptId,
        );

        if (!question) return;

        question.hintUsed = true;
        question.hint = action.payload.hint;
      })
      .addCase(fetchHint.rejected, (state, action) => {
        if (action.payload?.code === "INTERVIEW_ENDED") state.roomEnded = true;
      })
      .addCase(submitRound.pending, (state) => {
        state.submitStatus = "loading";
        state.submitError = null;
      })
      .addCase(submitRound.fulfilled, (state, action) => {
        state.submitStatus = "idle";

        if (action.meta.arg.isFinal) state.roomFinished = true;
      })
      .addCase(submitRound.rejected, (state, action) => {
        state.submitStatus = "idle";

        if (action.payload?.code === "INTERVIEW_ENDED") {
          state.roomEnded = true;
          return;
        }

        state.submitError = action.payload?.message ?? "Something went wrong";
      })
      .addCase(reportCheat.fulfilled, (state) => {
        state.roomCheated = true;
      })
      .addCase(reportCheat.rejected, (state, action) => {
        if (action.payload?.code === "INTERVIEW_ENDED") {
          state.roomEnded = true;
          return;
        }

        state.roomError = action.payload?.message ?? "Something went wrong";
      });
  },
});

export const { clearInterviewError, resetRoom } = interviewSlice.actions;

export default interviewSlice.reducer;
