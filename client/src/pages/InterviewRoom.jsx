import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router";
import AnswerPanel from "../components/AnswerPanel.jsx";
import HintBox from "../components/HintBox.jsx";
import Notice from "../components/Notice.jsx";
import QuestionPanel from "../components/QuestionPanel.jsx";
import RoomBanner from "../components/RoomBanner.jsx";
import RoundSubmit from "../components/RoundSubmit.jsx";
import SidePanel from "../components/SidePanel.jsx";
import MiniProjectRoom from "../features/miniProject/MiniProjectRoom.jsx";
import { flushProject } from "../features/miniProject/miniProjectSlice.js";
import useAntiCheat, { CHEAT_AWAY_MS } from "../hooks/useAntiCheat.js";
import useSpeech, { buildSpeechText } from "../hooks/useSpeech.js";
import useTimer from "../hooks/useTimer.js";
import {
  fetchHint,
  fetchRound,
  reportCheat,
  reportRefresh,
  resetRoom,
  submitAnswer,
  submitRound,
} from "../store/interviewSlice.js";

const POLL_MS = 2000;

let reloadChecked = false;

const isReloadOfThisPage = () => {
  if (reloadChecked) return false;

  reloadChecked = true;

  const [entry] = performance.getEntriesByType("navigation");

  return (
    entry?.type === "reload" &&
    new URL(entry.name).pathname === window.location.pathname
  );
};

const refreshMessage = ({ penaltyMarks }) =>
  penaltyMarks > 0
    ? `Page refreshed again. ${penaltyMarks} mark${penaltyMarks > 1 ? "s" : ""} will be deducted from your score.`
    : "Page refreshed. Refreshing again will deduct marks from your score.";

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
  const projectEnded = useSelector((state) => state.miniProject.ended);
  const [activeId, setActiveId] = useState(null);
  const [awaySeconds, setAwaySeconds] = useState(null);
  const [refreshInfo, setRefreshInfo] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const { supported: canSpeak, speaking, speak, stop } = useSpeech();
  const secondsLeft = useTimer(round?.endsAt);
  const isTimeUp = round?.secondsLeft === 0 || secondsLeft === 0;
  const isRoomActive =
    Boolean(round) && !roomEnded && !roomFinished && !roomCheated && !roomError;

  useEffect(() => {
    dispatch(resetRoom());

    const load = async () => {
      if (isReloadOfThisPage()) {
        const result = await dispatch(reportRefresh(id));

        if (reportRefresh.fulfilled.match(result)) {
          setRefreshInfo(result.payload);
        }
      }

      dispatch(fetchRound(id));
    };

    load();
  }, [dispatch, id]);

  useEffect(() => {
    if (!isTimeUp) return undefined;

    const pollId = setInterval(() => dispatch(fetchRound(id)), POLL_MS);

    return () => clearInterval(pollId);
  }, [dispatch, id, isTimeUp]);

  useAntiCheat({
    enabled: isRoomActive,
    onWarn: setAwaySeconds,
    onCheat: () => dispatch(reportCheat(id)),
  });

  const activeQuestion =
    questions.find((question) => question.id === activeId) ??
    questions.find((question) => question.status !== "answered") ??
    questions[0];
  const activeIndex = questions.indexOf(activeQuestion);
  const isProject = activeQuestion?.format === "project";
  const unanswered = questions.filter(
    (question) =>
      question.format !== "project" && question.status !== "answered",
  ).length;
  const speechText =
    activeQuestion && !isProject ? buildSpeechText(activeQuestion) : "";

  useEffect(() => {
    if (!isRoomActive || isTimeUp || !speechText) {
      stop();
      return;
    }

    speak(speechText);
  }, [isRoomActive, isTimeUp, speechText, speak, stop]);

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
    if (isProject) {
      const saved = await dispatch(flushProject());

      setSaveBlocked(!saved.payload);

      if (!saved.payload) return;
    }

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

  if (roomFinished || roomEnded || projectEnded) {
    return <Navigate to={`/interview/${id}/review`} replace />;
  }

  if (roomCheated) {
    return (
      <Notice title="Interview ended">
        <p className="text-sm text-danger">
          You stayed away from the interview window for too long, so this
          interview was ended and marked with a cheating flag. Answers saved so
          far have been graded.
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

  const notices = (
    <>
      {refreshInfo && (
        <RoomBanner onDismiss={() => setRefreshInfo(null)}>
          {refreshMessage(refreshInfo)}
        </RoomBanner>
      )}
      {awaySeconds !== null && (
        <RoomBanner onDismiss={() => setAwaySeconds(null)}>
          You were away from this window for {awaySeconds} seconds. Staying away
          for {CHEAT_AWAY_MS / 60000} minutes or more ends the interview as
          cheating.
        </RoomBanner>
      )}
      {saveBlocked && (
        <RoomBanner onDismiss={() => setSaveBlocked(false)}>
          Your code could not be saved yet. Check your connection and submit
          again.
        </RoomBanner>
      )}
      {isTimeUp && (
        <p
          role="status"
          className="mx-6 mt-6 rounded-md border border-warn px-3 py-2 text-sm text-warn"
        >
          Time is up for this round. Your saved answers are being submitted.
        </p>
      )}
    </>
  );

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

      {isProject ? (
        <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
          {notices}
          <MiniProjectRoom
            key={activeQuestion.id}
            attemptId={activeQuestion.id}
            isTimeUp={isTimeUp}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
          <div className="flex-1 border-b border-line lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <QuestionPanel
              question={activeQuestion}
              number={activeIndex + 1}
              total={questions.length}
              canSpeak={canSpeak}
              isSpeaking={speaking}
              onRead={() => speak(speechText)}
              onStop={stop}
            />
            <HintBox
              key={activeQuestion.id}
              question={activeQuestion}
              disabled={isTimeUp}
              onReveal={handleHint}
            />
          </div>
          <div className="flex-1 lg:overflow-y-auto">
            {notices}
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
      )}
    </div>
  );
};

export default InterviewRoom;
