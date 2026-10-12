import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveProject } from "../miniProjectSlice.js";

const AUTOSAVE_DELAY_MS = 1500;

const useAutosave = () => {
  const dispatch = useDispatch();
  const { saveStatus, editVersion } = useSelector((state) => state.miniProject);

  useEffect(() => {
    if (saveStatus !== "dirty") return undefined;

    const timer = setTimeout(() => dispatch(saveProject()), AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [dispatch, saveStatus, editVersion]);
};

export default useAutosave;
