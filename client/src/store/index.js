import { combineReducers, configureStore, isAnyOf } from "@reduxjs/toolkit";
import { setSessionEndedHandler } from "../api/axios.js";
import miniProjectReducer from "../features/miniProject/miniProjectSlice.js";
import authReducer, { logoutUser, markSessionEnded } from "./authSlice.js";
import customQuestionReducer from "./customQuestionSlice.js";
import historyReducer from "./historySlice.js";
import interviewReducer from "./interviewSlice.js";
import reviewReducer from "./reviewSlice.js";
import selectionReducer from "./selectionSlice.js";
import statsReducer from "./statsSlice.js";
import adminStatsReducer from "./adminStatsSlice.js";
import toastReducer from "./toastSlice.js";

const appReducer = combineReducers({
  auth: authReducer,
  history: historyReducer,
  interview: interviewReducer,
  review: reviewReducer,
  miniProject: miniProjectReducer,
  customQuestions: customQuestionReducer,
  selection: selectionReducer,
  stats: statsReducer,
  adminStats: adminStatsReducer,
  toasts: toastReducer,
});

const isLoggedOut = isAnyOf(
  logoutUser.fulfilled,
  logoutUser.rejected,
  markSessionEnded,
);

const rootReducer = (state, action) => {
  if (isLoggedOut(action)) {
    return appReducer({ auth: state?.auth }, action);
  }

  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });

setSessionEndedHandler(() => store.dispatch(markSessionEnded()));
