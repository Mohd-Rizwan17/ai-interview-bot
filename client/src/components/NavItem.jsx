import { NavLink } from "react-router";

const NavItem = ({ to, end, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `block rounded-md border px-3 py-2 text-sm ${
        isActive
          ? "border-accent text-accent"
          : "border-transparent hover:bg-ground"
      }`
    }
  >
    {children}
  </NavLink>
);

export default NavItem;
