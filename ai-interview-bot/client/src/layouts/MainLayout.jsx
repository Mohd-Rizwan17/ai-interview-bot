import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";
import ToastHost from "../components/ToastHost.jsx";
import { fetchMe } from "../store/authSlice.js";

const MainLayout = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user?.role);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.dataset.role = role ?? "guest";
  }, [role]);

  return (
    <div className="min-h-screen text-ink">
      <Outlet />
      <ToastHost />
    </div>
  );
};

export default MainLayout;
