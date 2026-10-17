import { useSelector } from "react-redux";
import AdminOverview from "./AdminOverview.jsx";
import Dashboard from "./Dashboard.jsx";

const Home = () => {
  const role = useSelector((state) => state.auth.user?.role);

  return role === "admin" ? <AdminOverview /> : <Dashboard />;
};

export default Home;
