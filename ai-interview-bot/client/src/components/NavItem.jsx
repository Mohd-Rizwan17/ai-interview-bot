import { NavLink } from "react-router";

const NavItem = ({ to, end, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `block rounded-lg border px-3 py-2 text-sm ${
        isActive
          ? "border-accent/30 bg-accent/15 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          : "border-transparent hover:bg-white/5"
      }`
    }
  >
    {children}
  </NavLink>
);

export default NavItem;
