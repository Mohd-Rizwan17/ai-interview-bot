import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import AnswerPanel from "../components/AnswerPanel.jsx";
import QuestionPanel from "../components/QuestionPanel.jsx";
import SidePanel from "../components/SidePanel.jsx";
import {
  fetchRound,
  resetRoom,
  submitAnswer,
} from "../store/interviewSlice.js";

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
  const { round, questions, roomError, roomEnded, answerStatus, answerError } =
    useSelector((state) => state.interview);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    dispatch(resetRoom());
    dispatch(fetchRound(id));
  }, [dispatch, id]);

  const activeQuestion =
    questions.find((question) => question.id === activeId) ??
    questions.find((question) => question.status !== "answered") ??
    questions[0];
  const activeIndex = questions.indexOf(activeQuestion);

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
        onSelect={setActiveId}
      />
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="flex-1 border-b border-line lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <QuestionPanel
            question={activeQuestion}
            number={activeIndex + 1}
            total={questions.length}
          />
        </div>
        <div className="flex-1 lg:overflow-y-auto">
          <AnswerPanel
            key={activeQuestion.id}
            question={activeQuestion}
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
