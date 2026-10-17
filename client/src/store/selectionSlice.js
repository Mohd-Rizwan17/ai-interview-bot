import { createSlice } from "@reduxjs/toolkit";
import { ALL_ROUNDS } from "../constants/rounds.js";

const initialState = {
  rounds: [],
  difficulty: "medium",
  projectStack: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    toggleRound: (state, action) => {
      const key = action.payload;

      state.rounds = state.rounds.includes(key)
        ? state.rounds.filter((item) => item !== key)
        : [...state.rounds, key];
    },
    selectAllRounds: (state) => {
      state.rounds = [...ALL_ROUNDS];
    },
    clearRounds: (state) => {
      state.rounds = [];
    },
    setDifficulty: (state, action) => {
      state.difficulty = action.payload;
    },
    setProjectStack: (state, action) => {
      state.projectStack = action.payload;
    },
  },
});

export const {
  toggleRound,
  selectAllRounds,
  clearRounds,
  setDifficulty,
  setProjectStack,
} = selectionSlice.actions;

export default selectionSlice.reducer;
