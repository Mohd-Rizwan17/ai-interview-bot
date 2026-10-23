import { Outlet } from "react-router";
import ConstellationGrid from "../components/ConstellationGrid.jsx";

const AuthLayout = () => (
  <>
    <ConstellationGrid isDark />
    <Outlet />
  </>
);

export default AuthLayout;
