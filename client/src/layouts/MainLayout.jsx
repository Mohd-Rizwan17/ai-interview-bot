import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";
import ToastHost from "../components/ToastHost.jsx";
import { fetchMe } from "../store/authSlice.js";

const MainLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <div className="min-h-screen text-ink">
      <Outlet />
      <ToastHost />
    </div>
  );
};

export default MainLayout;
