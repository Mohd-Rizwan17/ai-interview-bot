import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const projectWorkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },

    stack: {
      type: String,
      required: true,
    },

    project: {
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      requirements: { type: [String], default: [] },
      timeLimitSec: { type: Number, required: true },
    },

    files: {
      type: [fileSchema],
      default: [],
    },

    folders: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

projectWorkSchema.index({ attempt: 1 }, { unique: true });

projectWorkSchema.index({ interview: 1 });

export const ProjectWork = mongoose.model("ProjectWork", projectWorkSchema);
