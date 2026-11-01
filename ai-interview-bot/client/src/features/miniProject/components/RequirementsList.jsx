import { useState } from "react";

const RequirementsList = ({ project }) => {
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (index) => {
    setChecked((current) => {
      const next = new Set(current);

      if (next.has(index)) next.delete(index);
      else next.add(index);

      return next;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold">Task</h2>
      <p className="mt-1 text-sm text-muted">{project.description}</p>

      <h2 className="mt-4 text-sm font-semibold">Requirements</h2>
      <p className="text-xs text-muted">
        Tick each one yourself as you finish it. Mini projects are not graded.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {project.requirements.map((requirement, index) => (
          <li key={requirement}>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked.has(index)}
                onChange={() => toggle(index)}
                className="mt-1"
              />
              <span
                className={checked.has(index) ? "text-muted line-through" : ""}
              >
                {requirement}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequirementsList;
