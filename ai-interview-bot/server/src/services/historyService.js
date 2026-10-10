import { DEFAULT_RETENTION_DAYS } from "../constants/interview.js";
import { Attempt } from "../models/Attempt.js";
import { Interview } from "../models/Interview.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const removeInterviews = async (filter) => {
  const ids = await Interview.distinct("_id", filter);

  if (ids.length === 0) return 0;

  await Interview.deleteMany({ _id: { $in: ids } });
  await Attempt.deleteMany({ interview: { $in: ids } });

  return ids.length;
};

export const purgeExpiredInterviews = ({
  _id,
  historyRetentionDays = DEFAULT_RETENTION_DAYS,
}) =>
  removeInterviews({
    user: _id,
    status: { $ne: "in_progress" },
    createdAt: { $lt: new Date(Date.now() - historyRetentionDays * DAY_MS) },
  });

export const deleteInterviewById = (userId, interviewId) =>
  removeInterviews({ _id: interviewId, user: userId });

export const clearFinishedInterviews = (userId) =>
  removeInterviews({ user: userId, status: { $ne: "in_progress" } });
