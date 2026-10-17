import { Interview } from "../models/Interview.js";

const TREND_LIMIT = 8;
const RECENT_LIMIT = 5;
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
