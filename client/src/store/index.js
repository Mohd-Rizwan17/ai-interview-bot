import { configureStore } from "@reduxjs/toolkit";
import { setSessionEndedHandler } from "../api/axios.js";
import authReducer, { markSessionEnded } from "./authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setSessionEndedHandler(() => store.dispatch(markSessionEnded()));
