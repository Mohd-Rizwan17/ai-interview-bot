import { Link } from "react-router";

const capitalize = (text) => `${text[0].toUpperCase()}${text.slice(1)}`;

const describe = ([first]) => {
  const level = capitalize(first.difficulty);

  if (first.count === 0) {
    return `${level} has no questions. Users who pick My Questions on ${level} get an error.`;
  }

  return `${level} has the fewest questions. Users on ${level} see the same ones often.`;
};

const NeedsMoreList = ({ items }) => {
  if (items.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Every difficulty has enough questions.
      </p>
    );
  }

  return (
    <>
      <p className="mt-1 text-sm text-muted">{describe(items)}</p>
      <ul className="mt-4 flex flex-col divide-y divide-line border-t border-line">
        {items.map((item) => (
          <li
            key={item.difficulty}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <span>
              <span className="capitalize">{item.difficulty}</span> · My
              Questions round
            </span>
            <span className="shrink-0 font-mono text-warn">
              {item.count}
              <span className="ml-2 text-xs text-muted">
                need {item.needed} more
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-sm text-muted">Add more</span>
        <Link
          to="/my-questions?add=1"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ground"
        >
          Add question
        </Link>
      </div>
    </>
  );
};

export default NeedsMoreList;
