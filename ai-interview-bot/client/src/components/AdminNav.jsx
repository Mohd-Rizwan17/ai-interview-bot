import NavItem from "./NavItem.jsx";

const AdminNav = () => (
  <nav className="flex flex-col gap-1 px-4 pb-4">
    <NavItem to="/" end>
      Overview
    </NavItem>
    <NavItem to="/leaderboard">Leaderboard</NavItem>
    <NavItem to="/my-questions">My Questions</NavItem>
    <NavItem to="/pdf-import">PDF import</NavItem>
  </nav>
);

export default AdminNav;
