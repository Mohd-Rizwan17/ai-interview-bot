import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router";
import AnswerPanel from "../components/AnswerPanel.jsx";
import HintBox from "../components/HintBox.jsx";
import Notice from "../components/Notice.jsx";
import QuestionPanel from "../components/QuestionPanel.jsx";
import RoundSubmit from "../components/RoundSubmit.jsx";
import SidePanel from "../components/SidePanel.jsx";
import useAntiCheat from "../hooks/useAntiCheat.js";
import useTimer from "../hooks/useTimer.js";
import {
  fetchHint,
  fetchRound,
  reportCheat,
  resetRoom,
  submitAnswer,
  submitRound,
} from "../store/interviewSlice.js";

const POLL_MS = 2000;

const InterviewRoom = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    round,
    questions,
    roomError,
    roomEnded,
    roomFinished,
    roomCheated,
    answerStatus,
    answerError,
    submitStatus,
    submitError,
  } = useSelector((state) => state.interview);
  const [activeId, setActiveId] = useState(null);
  const secondsLeft = useTimer(round?.endsAt);
  const isTimeUp = round?.secondsLeft === 0 || secondsLeft === 0;
  const isRoomActive =
    Boolean(round) && !roomEnded && !roomFinished && !roomCheated && !roomError;

  useEffect(() => {
    dispatch(resetRoom());
    dispatch(fetchRound(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!isTimeUp) return undefined;

    const pollId = setInterval(() => dispatch(fetchRound(id)), POLL_MS);

    return () => clearInterval(pollId);
  }, [dispatch, id, isTimeUp]);

  useAntiCheat({
    enabled: isRoomActive,
    interviewId: id,
    onCheat: () => dispatch(reportCheat(id)),
  });

  const activeQuestion =
    questions.find((question) => question.id === activeId) ??
    questions.find((question) => question.status !== "answered") ??
    questions[0];
  const activeIndex = questions.indexOf(activeQuestion);
  const unanswered = questions.filter(
    (question) => question.status !== "answered",
  ).length;

  const handleSubmit = async (answer) => {
    const result = await dispatch(
      submitAnswer({
        interviewId: id,
        attemptId: activeQuestion.id,
        ...answer,
      }),
    );

    if (submitAnswer.fulfilled.match(result)) {
      const next = questions[activeIndex + 1];
      if (next) setActiveId(next.id);
    }
  };

  const handleHint = async () => {
    const result = await dispatch(
      fetchHint({ interviewId: id, attemptId: activeQuestion.id }),
    );

    if (fetchHint.rejected.match(result)) {
      return result.payload?.message ?? "Something went wrong";
    }

    return null;
  };

  const handleSubmitRound = async () => {
    const result = await dispatch(
      submitRound({
        interviewId: id,
        roundKey: round.key,
        isFinal: round.isLastRound,
      }),
    );

    if (submitRound.fulfilled.match(result) && !round.isLastRound) {
      dispatch(fetchRound(id));
    }
  };

  if (roomFinished || roomEnded) {
    return <Navigate to={`/interview/${id}/review`} replace />;
  }

  if (roomCheated) {
    return (
      <Notice title="Interview ended">
        <p className="text-sm text-danger">
          You left the interview window, so this interview was ended and marked
          with a cheating flag. Answers saved so far have been graded.
        </p>
        <Link
          to={`/interview/${id}/review`}
          replace
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
        >
          View review
        </Link>
      </Notice>
    );
  }

  if (roomError) {
    return (
      <Notice title="Cannot open this interview">
        <p className="text-sm text-danger">{roomError}</p>
      </Notice>
    );
  }

  if (!round || !activeQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading interview...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <SidePanel
        round={round}
        questions={questions}
        activeId={activeQuestion.id}
        secondsLeft={isTimeUp ? 0 : secondsLeft}
        onSelect={setActiveId}
      >
        <RoundSubmit
          key={round.key}
          isLast={round.isLastRound}
          unanswered={unanswered}
          isSubmitting={submitStatus === "loading"}
          error={submitError}
          onSubmit={handleSubmitRound}
        />
      </SidePanel>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="flex-1 border-b border-line lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <QuestionPanel
            question={activeQuestion}
            number={activeIndex + 1}
            total={questions.length}
          />
          <HintBox
            key={activeQuestion.id}
            question={activeQuestion}
            disabled={isTimeUp}
            onReveal={handleHint}
          />
        </div>
        <div className="flex-1 lg:overflow-y-auto">
          {isTimeUp && (
            <p
              role="status"
              className="mx-6 mt-6 rounded-md border border-warn px-3 py-2 text-sm text-warn"
            >
              Time is up for this round. Your saved answers are being submitted.
            </p>
          )}
          <AnswerPanel
            key={activeQuestion.id}
            question={activeQuestion}
            disabled={isTimeUp}
            isSubmitting={answerStatus === "loading"}
            error={answerError}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
