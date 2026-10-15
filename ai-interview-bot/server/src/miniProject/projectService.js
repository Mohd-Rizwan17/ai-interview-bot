import { Attempt } from "../models/Attempt.js";
import { Interview } from "../models/Interview.js";
import { expireRoundIfNeeded } from "../services/interviewFlowService.js";
import { refreshProgress } from "../services/interviewService.js";
import { ApiError } from "../utils/ApiError.js";
import { findProject, STACKS } from "./projectBank.js";
import { ProjectWork } from "./ProjectWork.js";

const notFound = () => new ApiError(404, "Project not found");

const findOwnedProject = async (userId, attemptId) => {
  const attempt = await Attempt.findOne({ _id: attemptId, format: "project" });

  if (!attempt) throw notFound();

  const interview = await Interview.findOne({
    _id: attempt.interview,
    user: userId,
  });

  if (!interview) throw notFound();

  return { attempt, interview: await expireRoundIfNeeded(interview) };
};

const assertOpen = (interview, attempt) => {
  if (interview.status !== "in_progress") {
    throw new ApiError(409, "Interview has already ended", "INTERVIEW_ENDED");
  }

  const round = interview.rounds[interview.currentRoundIndex];

  if (round?.status !== "in_progress" || round.key !== attempt.roundKey) {
    throw new ApiError(409, "This project is not open right now");
  }
};

const createWork = async (interview, attempt) => {
  const project = findProject(attempt.project?.id);

  if (!project) throw notFound();

  const stack = attempt.project.stack;

  try {
    return await ProjectWork.create({
      user: interview.user,
      interview: interview._id,
      attempt: attempt._id,
      stack,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        timeLimitSec: project.timeLimitSec,
      },
      files: STACKS[stack].starterFiles,
    });
  } catch (error) {
    if (error.code === 11000) {
      return ProjectWork.findOne({ attempt: attempt._id });
    }

    throw error;
  }
};

const toClientWork = (work) => ({
  stack: work.stack,
  project: {
    id: work.project.id,
    title: work.project.title,
    description: work.project.description,
    requirements: work.project.requirements,
    timeLimitSec: work.project.timeLimitSec,
  },
  files: work.files.map(({ path, content }) => ({ path, content })),
  folders: work.folders,
});

const hasChanges = (files, stack) => {
  const starter = STACKS[stack]?.starterFiles ?? [];

  return (
    files.length !== starter.length ||
    files.some(
      (file) =>
        starter.find((item) => item.path === file.path)?.content !==
        file.content,
    )
  );
};

const markAnswered = async (interview, attempt) => {
  const result = await Attempt.updateOne(
    { _id: attempt._id, status: { $ne: "answered" } },
    { $set: { status: "answered", answeredAt: new Date() } },
  );

  if (result.modifiedCount > 0) await refreshProgress(interview);
};

export const getWork = async (userId, attemptId) => {
  const { attempt, interview } = await findOwnedProject(userId, attemptId);

  if (interview.status === "incomplete") {
    throw new ApiError(403, "Incomplete interviews cannot be opened");
  }

  const isRunning = interview.status === "in_progress";

  if (isRunning) assertOpen(interview, attempt);

  const work =
    (await ProjectWork.findOne({ attempt: attempt._id })) ??
    (isRunning ? await createWork(interview, attempt) : null);

  if (work) return toClientWork(work);

  return {
    stack: attempt.project?.stack,
    project: {
      id: attempt.project?.id,
      title: attempt.topic,
      description: attempt.question,
      requirements: [],
      timeLimitSec: attempt.timeLimitSec,
    },
    files: [],
    folders: [],
  };
};

export const saveWork = async (userId, attemptId, { files, folders = [] }) => {
  const { attempt, interview } = await findOwnedProject(userId, attemptId);

  assertOpen(interview, attempt);

  const work = await ProjectWork.findOneAndUpdate(
    { attempt: attempt._id },
    {
      $set: {
        files: files.map(({ path, content }) => ({ path, content })),
        folders,
      },
    },
    { returnDocument: "after" },
  );

  if (!work) throw new ApiError(409, "Open the project before saving");

  const answered = hasChanges(files, work.stack);

  if (answered) await markAnswered(interview, attempt);

  return { savedAt: work.updatedAt, answered };
};
