import { NavLink } from 'react-router-dom'
import Logo from './Logo'

function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-base uppercase tracking-wide ${isActive ? 'text-cyan glow-cyan' : 'text-sub hover:text-cyan'}`;

  return (
    <nav className="relative flex h-28 items-center gap-8 overflow-visible border-b border-cyan/20 bg-panel px-10">
      <NavLink to="/"><Logo /></NavLink>

      <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
      <NavLink to="/markets" className={linkClass}>Markets</NavLink>

      <span className="ml-auto flex items-center gap-2 rounded-full border border-up/40 px-3 py-1">
        <span className="logo-life h-2 w-2 rounded-full bg-up"></span>
        <span className="text-xs tracking-wide text-up">LIVE</span>
      </span>

      <div className="nav-sweep absolute bottom-0 left-0 h-0.5 w-full"></div>
    </nav>
  );
}

export default Navbar;