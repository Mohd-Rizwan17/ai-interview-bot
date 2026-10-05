import mongoose from "mongoose";
import {
  DIFFICULTIES,
  FIELDS,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
} from "../constants/interview.js";

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: INTERVIEW_TYPES, required: true },
    field: { type: String, enum: FIELDS },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    status: { type: String, enum: INTERVIEW_STATUSES, default: "in_progress" },
    totalQuestions: { type: Number, default: 15, min: 5, max: 30 },
    answeredQuestions: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    cheatingFlags: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true },
);

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: "in_progress" } },
);

export const Interview = mongoose.model("Interview", interviewSchema);
