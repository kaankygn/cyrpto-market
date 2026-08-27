import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo'
import CoinSearch from './CoinSearch'

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const lastGlitch = useRef(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const now = Date.now();
      if (now - lastGlitch.current > 5000 && Math.random() < 0.03) {
        lastGlitch.current = now;
        setGlitch(true);
        setTimeout(() => setGlitch(false), 800);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-base uppercase tracking-wide ${isActive ? 'text-cyan glow-cyan' : 'text-sub hover:text-cyan'}`;

  return (
    <nav className={`nav-bar sticky top-0 z-50 flex h-28 items-center gap-6 overflow-visible border-b border-cyan/20 bg-panel px-5 md:gap-8 md:px-10 ${scrolled ? 'nav-scrolled' : ''} ${glitch ? 'nav-glitch' : ''}`}>
      <div className="nav-scanlines pointer-events-none absolute inset-0"></div>
      <NavLink to="/"><Logo glitch={glitch} /></NavLink>

      <div className="hidden items-center gap-8 md:flex">
        <NavLink to="/" end className={linkClass}>Terminal</NavLink>
        <NavLink to="/markets" className={linkClass}>Markets</NavLink>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden md:block"><CoinSearch /></div>

        <span className={`flex items-center gap-2 rounded-full border px-3 py-1 ${online ? 'border-up/40' : 'border-down/40'}`}>
          <span className={`logo-life h-2 w-2 rounded-full ${online ? 'bg-up' : 'bg-down'}`}></span>
          <span className={`text-xs tracking-wide ${online ? 'text-up' : 'text-down'}`}>{online ? 'LIVE' : 'OFFLINE'}</span>
        </span>

        <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
          className="flex h-9 w-9 items-center justify-center rounded border border-cyan/30 text-cyan md:hidden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-cyan/20 bg-panel px-5 py-4 md:hidden">
          <div className="mb-3"><CoinSearch /></div>
          <div className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={linkClass}>Terminal</NavLink>
            <NavLink to="/markets" onClick={() => setMenuOpen(false)} className={linkClass}>Markets</NavLink>
          </div>
        </div>
      )}

      <div className="nav-sweep absolute bottom-0 left-0 h-0.5 w-full"></div>
    </nav>
  );
}

export default Navbar;