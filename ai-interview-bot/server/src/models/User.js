import mongoose from "mongoose";
import {
  DEFAULT_RETENTION_DAYS,
  RETENTION_OPTIONS,
  USER_ROLES,
} from "../constants/interview.js";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    role: { type: String, enum: USER_ROLES, default: "user" },
    passwordHash: { type: String, required: true, select: false },
    historyRetentionDays: {
      type: Number,
      enum: RETENTION_OPTIONS,
      default: DEFAULT_RETENTION_DAYS,
    },
    activeSession: {
      sessionId: String,
      device: String,
      lastActiveAt: Date,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.activeSession;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model("User", userSchema);
