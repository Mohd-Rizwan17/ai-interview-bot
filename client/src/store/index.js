import { configureStore } from "@reduxjs/toolkit";
import { setSessionEndedHandler } from "../api/axios.js";
import authReducer, { markSessionEnded } from "./authSlice.js";
import interviewReducer from "./interviewSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
  },
});

setSessionEndedHandler(() => store.dispatch(markSessionEnded()));
