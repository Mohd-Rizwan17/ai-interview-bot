import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Notice from "../components/Notice.jsx";
import PdfImport from "../components/PdfImport.jsx";
import {
  clearActionError,
  fetchCustomQuestions,
} from "../store/customQuestionSlice.js";
import PageLoader from "../components/PageLoader.jsx";


const ImportPdf = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loaded, error } = useSelector((state) => state.customQuestions);

  useEffect(() => {
    dispatch(fetchCustomQuestions());

    return () => {
      dispatch(clearActionError());
    };
  }, [dispatch]);

  if (error) {
    return (
      <Notice title="Cannot load your questions">
        <p className="text-sm text-danger">{error}</p>
      </Notice>
    );
  }

 if (!loaded) {
   return <PageLoader label="Loading" />;
 }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">PDF import</h1>
      <p className="text-sm text-muted">
        Imported questions go into the My Questions round.
      </p>

      <PdfImport onClose={() => navigate("/my-questions")} />
    </main>
  );
};

export default ImportPdf;
