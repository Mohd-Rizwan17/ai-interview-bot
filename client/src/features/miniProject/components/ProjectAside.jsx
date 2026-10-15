import { useState } from "react";
import PreviewFrame from "./PreviewFrame.jsx";
import RequirementsList from "./RequirementsList.jsx";

const TABS = [
  { key: "task", label: "Task" },
  { key: "preview", label: "Preview" },
];

const ProjectAside = ({ project, footer }) => {
  const [tab, setTab] = useState("task");

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-line bg-panel lg:w-96 lg:border-l lg:border-t-0">
      <div role="tablist" className="flex border-b border-line">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm ${
              tab === key ? "border-b-2 border-accent text-ink" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto ${tab === "task" ? "" : "hidden"}`}
      >
        <RequirementsList project={project} />
      </div>

      <div
        className={`min-h-96 flex-1 ${tab === "preview" ? "flex flex-col" : "hidden"}`}
      >
        <PreviewFrame />
      </div>

      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </aside>
  );
};

export default ProjectAside;
