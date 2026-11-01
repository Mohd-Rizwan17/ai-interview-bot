import { useDispatch, useSelector } from "react-redux";
import { saveProject } from "../miniProjectSlice.js";

const SAVE_LABELS = {
  saved: "Saved",
  dirty: "Save",
  saving: "Saving...",
  error: "Retry save",
};

const ProjectActions = ({ isTimeUp, children }) => {
  const dispatch = useDispatch();
  const saveStatus = useSelector((state) => state.miniProject.saveStatus);
  const isDisabled =
    isTimeUp || saveStatus === "saved" || saveStatus === "saving";

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => dispatch(saveProject())}
        disabled={isDisabled}
        className="w-full rounded-md border border-line px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {SAVE_LABELS[saveStatus]}
      </button>
      {children}
    </div>
  );
};

export default ProjectActions;
