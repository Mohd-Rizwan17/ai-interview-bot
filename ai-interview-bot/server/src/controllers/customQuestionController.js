import { DIFFICULTIES, MAX_CUSTOM_QUESTIONS } from "../constants/interview.js";
import { CustomQuestion } from "../models/CustomQuestion.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCustomQuestion = asyncHandler(async (req, res) => {
  const count = await CustomQuestion.countDocuments();

  if (count >= MAX_CUSTOM_QUESTIONS) {
    throw new ApiError(
      400,
      `You can save up to ${MAX_CUSTOM_QUESTIONS} custom questions`,
    );
  }

  const {
    format,
    difficulty,
    topic,
    question,
    options,
    correctOption,
    idealAnswer,
    keywords,
    explanation,
    hint,
    source,
  } = req.body;

  const data = {
    user: req.user._id,
    format,
    difficulty,
    topic: topic || "Custom",
    question,
    explanation: explanation || undefined,
    hint: hint || undefined,
    source: source || undefined,
  };

  if (format === "mcq") {
    Object.assign(data, { options, correctOption });
  } else {
    Object.assign(data, { idealAnswer, keywords });
  }

  const created = await CustomQuestion.create(data);

  res.status(201).json({
    success: true,
    question: created,
  });
});

export const listCustomQuestions = asyncHandler(async (req, res) => {
  const questions = await CustomQuestion.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    questions,
  });
});

export const getCustomQuestionCounts = asyncHandler(async (req, res) => {
  const rows = await CustomQuestion.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(DIFFICULTIES.map((level) => [level, 0]));

  rows.forEach(({ _id, count }) => {
    if (_id in counts) counts[_id] = count;
  });

  res.json({
    success: true,
    counts,
  });
});

export const deleteCustomQuestion = asyncHandler(async (req, res) => {
  const deleted = await CustomQuestion.findOneAndDelete({
    _id: req.params.id,
  });

  if (!deleted) throw new ApiError(404, "Question not found");

  res.json({
    success: true,
    message: "Question deleted",
  });
});
