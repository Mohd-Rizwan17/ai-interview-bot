import {
  CUSTOM_QUESTION_FORMATS,
  DIFFICULTIES,
  QUESTIONS_PER_ROUND,
} from "../constants/interview.js";
import { CustomQuestion } from "../models/CustomQuestion.js";
import { Interview } from "../models/Interview.js";

const TREND_LIMIT = 8;
const RECENT_LIMIT = 5;
const IMPORT_LIMIT = 5;
const SCORE_FIELDS =
  "title status difficulty totalMarks obtainedMarks createdAt rounds";

const toPercent = (obtained, total) => Math.round((obtained / total) * 100);

const isScored = (interview) =>
  interview.status === "completed" && interview.totalMarks > 0;

const hasScore = (interview) =>
  ["completed", "ended_cheating"].includes(interview.status) &&
  interview.totalMarks > 0;

const buildByRound = (scored) => {
  const totals = new Map();

  scored.forEach((interview) => {
    interview.rounds.forEach((round) => {
      if (round.status !== "completed" || !(round.totalMarks > 0)) return;

      const entry = totals.get(round.key) ?? {
        key: round.key,
        title: round.title,
        obtained: 0,
        total: 0,
        attempts: 0,
      };

      entry.obtained += round.obtainedMarks ?? 0;
      entry.total += round.totalMarks;
      entry.attempts += 1;
      totals.set(round.key, entry);
    });
  });

  return [...totals.values()]
    .map(({ key, title, obtained, total, attempts }) => ({
      key,
      title,
      percent: toPercent(obtained, total),
      attempts,
    }))
    .sort((first, second) => second.percent - first.percent);
};

const pickRound = ({ key, title, percent }) => ({ key, title, percent });

export const buildStats = (interviews) => {
  const scored = interviews.filter(isScored);
  const byRound = buildByRound(scored);
  const percents = scored.map((item) =>
    toPercent(item.obtainedMarks, item.totalMarks),
  );

  return {
    interviews: interviews.filter((item) => item.status !== "in_progress")
      .length,
    averageScore: percents.length
      ? Math.round(
          percents.reduce((sum, value) => sum + value, 0) / percents.length,
        )
      : null,
    bestRound: byRound.length ? pickRound(byRound[0]) : null,
    weakestRound:
      byRound.length > 1 ? pickRound(byRound[byRound.length - 1]) : null,
    trend: scored
      .slice(0, TREND_LIMIT)
      .reverse()
      .map((item) => ({
        id: item._id,
        title: item.title,
        percent: toPercent(item.obtainedMarks, item.totalMarks),
        date: item.createdAt,
      })),
    byRound,
    recent: interviews.slice(0, RECENT_LIMIT).map((item) => ({
      _id: item._id,
      title: item.title,
      status: item.status,
      difficulty: item.difficulty,
      percent: hasScore(item)
        ? toPercent(item.obtainedMarks, item.totalMarks)
        : null,
      createdAt: item.createdAt,
    })),
  };
};

export const getUserStats = async (userId) => {
  const interviews = await Interview.find({ user: userId })
    .select(SCORE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  return buildStats(interviews);
};

const countQuestions = (rows) => {
  const byDifficulty = Object.fromEntries(
    DIFFICULTIES.map((level) => [level, 0]),
  );
  const byFormat = Object.fromEntries(
    CUSTOM_QUESTION_FORMATS.map((format) => [format, 0]),
  );

  rows.forEach(({ _id, count }) => {
    if (_id.difficulty in byDifficulty) byDifficulty[_id.difficulty] += count;
    if (_id.format in byFormat) byFormat[_id.format] += count;
  });

  return {
    total: Object.values(byDifficulty).reduce((sum, value) => sum + value, 0),
    ...byDifficulty,
    ...byFormat,
  };
};

const toImport = ({ _id, count, importedAt, difficulties }) => ({
  source: _id,
  count,
  importedAt,
  difficulty: difficulties.length === 1 ? difficulties[0] : "mixed",
});

const findNeedsMore = (questions) =>
  DIFFICULTIES.map((difficulty) => ({
    difficulty,
    count: questions[difficulty],
    needed: QUESTIONS_PER_ROUND - questions[difficulty],
  }))
    .filter((item) => item.needed > 0)
    .sort((first, second) => first.count - second.count);

export const buildAdminStats = ({
  questionRows,
  importRows,
  scored,
  interviewCount,
}) => {
  const questions = countQuestions(questionRows);

  return {
    questions,
    recentImports: importRows.map(toImport),
    usersByRound: buildByRound(scored),
    needsMore: findNeedsMore(questions),
    totals: { interviews: interviewCount },
  };
};

export const getAdminStats = async () => {
  const [questionRows, importRows, scored, interviewCount] = await Promise.all([
    CustomQuestion.aggregate([
      {
        $group: {
          _id: { difficulty: "$difficulty", format: "$format" },
          count: { $sum: 1 },
        },
      },
    ]),
    CustomQuestion.aggregate([
      { $match: { source: { $type: "string", $ne: "" } } },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          importedAt: { $max: "$createdAt" },
          difficulties: { $addToSet: "$difficulty" },
        },
      },
      { $sort: { importedAt: -1 } },
      { $limit: IMPORT_LIMIT },
    ]),
    Interview.find({ status: "completed", totalMarks: { $gt: 0 } })
      .select("rounds")
      .lean(),
    Interview.countDocuments({ status: { $ne: "in_progress" } }),
  ]);

  return buildAdminStats({ questionRows, importRows, scored, interviewCount });
};
