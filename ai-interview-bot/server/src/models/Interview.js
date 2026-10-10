import mongoose from "mongoose";

import {
  DIFFICULTIES,
  INTERVIEW_STATUSES,
  ROUND_TITLES,
} from "../constants/interview.js";

const roundSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["locked", "in_progress", "completed"],
      default: "locked",
    },
    startedAt: Date,
    completedAt: Date,
    timeLimitSec: {
      type: Number,
      required: true,
      min: 1,
    },
    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    answeredQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      required: true,
    },

    rounds: {
      type: [roundSchema],
      required: true,
      validate: {
        validator: (rounds) => rounds.length > 0,
        message: "At least one round is required",
      },
    },

    currentRoundIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: INTERVIEW_STATUSES,
      default: "in_progress",
    },

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    cheatingFlags: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    refreshCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    penaltyMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalSubmittedAt: Date,

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: Date,
  },
  { timestamps: true },
);

interviewSchema.index({ user: 1, createdAt: -1 });

interviewSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "in_progress" },
  },
);

export const Interview = mongoose.model("Interview", interviewSchema);
