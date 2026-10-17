import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

const AdminRoute = () => {
  const user = useSelector((state) => state.auth.user);

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
