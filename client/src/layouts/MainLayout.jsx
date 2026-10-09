import { Outlet } from "react-router";

const MainLayout = () => (
  <div className="min-h-screen bg-ground text-ink">
    <Outlet />
  </div>
);

export default MainLayout;
