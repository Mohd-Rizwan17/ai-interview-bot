import { Outlet } from "react-router";
import DotGrid from "../components/DotGrid.jsx";

const AuthLayout = () => (
  <>
    <DotGrid />
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgb(0_0_0/0.55),transparent_70%)]"
    />
    <Outlet />
  </>
);

export default AuthLayout;
