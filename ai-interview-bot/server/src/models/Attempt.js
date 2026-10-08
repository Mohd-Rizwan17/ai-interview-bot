import mongoose from "mongoose";

import { ATTEMPT_STATUSES, QUESTION_FORMATS } from "../constants/interview.js";

const attemptSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    roundKey: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    roundOrder: {
      type: Number,
      required: true,
      min: 1,
    },

    format: {
      type: String,
      enum: QUESTION_FORMATS,
      required: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctOption: {
      type: Number,
      select: false,
    },

    idealAnswer: {
      type: String,
      select: false,
    },

    explanation: {
      type: String,
      select: false,
    },

    hint: {
      type: String,
      select: false,
    },

    timeLimitSec: {
      type: Number,
      required: true,
      min: 10,
    },

    askedAt: Date,

    status: {
      type: String,
      enum: ATTEMPT_STATUSES,
      default: "asked",
    },

    userAnswer: {
      type: String,
      maxlength: 5000,
    },

    selectedOption: {
      type: Number,
    },

    answeredAt: Date,

    timeTakenSec: {
      type: Number,
      min: 0,
    },

    isCorrect: {
      type: Boolean,
    },

    maxScore: {
      type: Number,
      default: 1,
      min: 0,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    hintUsed: {
      type: Boolean,
      default: false,
    },

    feedback: String,
  },
  { timestamps: true },
);

attemptSchema.index({ interview: 1, order: 1 }, { unique: true });

attemptSchema.index({
  interview: 1,
  roundKey: 1,
  roundOrder: 1,
});

export const Attempt = mongoose.model("Attempt", attemptSchema);
