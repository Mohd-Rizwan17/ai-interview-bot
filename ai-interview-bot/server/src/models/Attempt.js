import mongoose from "mongoose";
import {
  ATTEMPT_STATUSES,
  QUESTION_FORMATS,
  QUESTION_SOURCES,
} from "../constants/interview.js";

const followUpSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: String,
    feedback: String,
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    order: { type: Number, required: true, min: 1 },
    source: { type: String, enum: QUESTION_SOURCES, required: true },
    format: { type: String, enum: QUESTION_FORMATS, required: true },
    topic: { type: String, required: true, trim: true },
    question: { type: String, required: true },
    options: [String],
    correctOption: { type: Number, select: false },
    timeLimitSec: { type: Number, required: true, min: 10 },
    askedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ATTEMPT_STATUSES, default: "asked" },
    userAnswer: { type: String, maxlength: 5000 },
    selectedOption: Number,
    answeredAt: Date,
    timeTakenSec: Number,
    isCorrect: Boolean,
    maxScore: { type: Number, default: 1, min: 0 },
    score: { type: Number, default: 0, min: 0 },
    hintUsed: { type: Boolean, default: false },
    feedback: String,
    idealAnswer: String,
    followUps: {
      type: [followUpSchema],
      validate: {
        validator: (items) => items.length <= 2,
        message: "A question can have at most 2 follow-ups",
      },
    },
  },
  { timestamps: true },
);

attemptSchema.index({ interview: 1, order: 1 }, { unique: true });

export const Attempt = mongoose.model("Attempt", attemptSchema);
