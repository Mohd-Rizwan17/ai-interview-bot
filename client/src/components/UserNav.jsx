import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ALL_ROUNDS, ROUNDS } from "../constants/rounds.js";
import { fetchCustomQuestionCounts } from "../store/customQuestionSlice.js";
import {
  clearRounds,
  selectAllRounds,
  toggleRound,
} from "../store/selectionSlice.js";
import NavItem from "./NavItem.jsx";
import RoundOption from "./RoundOption.jsx";

const capitalize = (text) => `${text[0].toUpperCase()}${text.slice(1)}`;

const UserNav = () => {
  const dispatch = useDispatch();
  const { rounds: selected, difficulty } = useSelector(
    (state) => state.selection,
  );
  const counts = useSelector((state) => state.customQuestions.counts);

  useEffect(() => {
    dispatch(fetchCustomQuestionCounts());
  }, [dispatch]);

  const metaFor = (key) => {
    if (key !== "my-questions" || !counts) return undefined;

    const count = counts[difficulty];

    return `${capitalize(difficulty)} · ${count} question${count === 1 ? "" : "s"}`;
  };

  return (
    <nav className="flex flex-col gap-1 px-4 pb-4">
      <NavItem to="/" end>
        Dashboard
      </NavItem>
      <NavItem to="/history">History</NavItem>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wide text-muted">Rounds</h2>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => dispatch(selectAllRounds())}
            title={`Selects ${ALL_ROUNDS.length} rounds: Aptitude, Reasoning, DSA, Frontend, Backend`}
            className="text-muted hover:text-ink"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => dispatch(clearRounds())}
            disabled={selected.length === 0}
            className="text-muted hover:text-ink disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-0.5">
        {ROUNDS.map((round) => (
          <li key={round.key}>
            <RoundOption
              title={round.title}
              note={round.note}
              meta={metaFor(round.key)}
              position={selected.indexOf(round.key) + 1}
              onToggle={() => dispatch(toggleRound(round.key))}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default UserNav;
