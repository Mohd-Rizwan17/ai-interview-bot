import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import AnswerPanel from "../components/AnswerPanel.jsx";
import QuestionPanel from "../components/QuestionPanel.jsx";
import RoundSubmit from "../components/RoundSubmit.jsx";
import SidePanel from "../components/SidePanel.jsx";
import useTimer from "../hooks/useTimer.js";
import {
  fetchRound,
  resetRoom,
  submitAnswer,
  submitRound,
} from "../store/interviewSlice.js";

const POLL_MS = 2000;

const Notice = ({ title, children }) => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
    <h1 className="text-xl font-semibold">{title}</h1>
    {children}
    <Link to="/" className="text-sm text-accent">
      Back to dashboard
    </Link>
  </main>
);

const InterviewRoom = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    round,
    questions,
    roomError,
    roomEnded,
    roomFinished,
    answerStatus,
    answerError,
    submitStatus,
    submitError,
  } = useSelector((state) => state.interview);
  const [activeId, setActiveId] = useState(null);
  const secondsLeft = useTimer(round?.endsAt);
  const isTimeUp = round?.secondsLeft === 0 || secondsLeft === 0;

  useEffect(() => {
    dispatch(resetRoom());
    dispatch(fetchRound(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!isTimeUp) return undefined;

    const pollId = setInterval(() => dispatch(fetchRound(id)), POLL_MS);

    return () => clearInterval(pollId);
  }, [dispatch, id, isTimeUp]);

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

  if (roomFinished) {
    return (
      <Notice title="Interview submitted">
        <p className="text-sm text-muted">
          Your answers are saved. The review page is coming soon.
        </p>
      </Notice>
    );
  }

  if (roomEnded) return <Notice title="This interview has ended" />;

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
