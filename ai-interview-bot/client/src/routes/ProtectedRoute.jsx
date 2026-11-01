import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import PageLoader from "../components/PageLoader.jsx";

const ProtectedRoute = () => {
  const { user, checked } = useSelector((state) => state.auth);

  if (!checked) return <PageLoader label="Loading" className="min-h-screen" />;

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
