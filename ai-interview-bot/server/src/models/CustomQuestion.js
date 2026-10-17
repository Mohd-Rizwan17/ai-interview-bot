import mongoose from "mongoose";

import {
  CUSTOM_QUESTION_FORMATS,
  DIFFICULTIES,
} from "../constants/interview.js";

function isMcq() {
  return this.format === "mcq";
}

function isTheory() {
  return this.format !== "mcq";
}

const customQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    format: {
      type: String,
      enum: CUSTOM_QUESTION_FORMATS,
      required: true,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      required: true,
    },

    source: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    options: {
      type: [String],
      default: [],
    },

    correctOption: {
      type: Number,
      min: 0,
      max: 3,
      required: isMcq,
    },

    idealAnswer: {
      type: String,
      trim: true,
      maxlength: 3000,
      required: isTheory,
    },

    keywords: {
      type: [String],
      default: [],
    },

    explanation: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    hint: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true },
);

customQuestionSchema.index({ user: 1, createdAt: -1 });

export const CustomQuestion = mongoose.model(
  "CustomQuestion",
  customQuestionSchema,
);
