import { NavLink } from "react-router";

const NavItem = ({ to, end, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `relative block rounded-md border border-transparent px-3 py-2 text-sm ${
        isActive
          ? "bg-line/50 text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent"
          : "hover:bg-ground"
      }`
    }
  >
    {children}
  </NavLink>
);

export default NavItem;
