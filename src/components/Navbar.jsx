import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import CoinSearch from './CoinSearch'

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [q, setQ] = useState('');
  const lastGlitch = useRef(0);
  const [online, setOnline] = useState(navigator.onLine);

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

  const submitSearch = (e) => {
    e.preventDefault();
    const s = q.trim().toUpperCase();
    if (!s) return;
    navigate(`/coin/${s.endsWith('USDT') ? s : s + 'USDT'}`);
    setQ('');
  };

  return (
    <nav className={`nav-bar sticky top-0 z-50 flex h-28 items-center gap-8 overflow-visible border-b border-cyan/20 bg-panel px-10 ${scrolled ? 'nav-scrolled' : ''} ${glitch ? 'nav-glitch' : ''}`}>
      <div className="nav-scanlines pointer-events-none absolute inset-0"></div>
      <NavLink to="/"><Logo glitch={glitch} /></NavLink>

      <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
      <NavLink to="/markets" className={linkClass}>Markets</NavLink>

      <div className="ml-auto flex items-center gap-4">
        <CoinSearch />

        <span className={`flex items-center gap-2 rounded-full border px-3 py-1 ${online ? 'border-up/40' : 'border-down/40'}`}>
          <span className={`logo-life h-2 w-2 rounded-full ${online ? 'bg-up' : 'bg-down'}`}></span>
          <span className={`text-xs tracking-wide ${online ? 'text-up' : 'text-down'}`}>{online ? 'LIVE' : 'OFFLINE'}</span>
        </span>
      </div>

      <div className="nav-sweep absolute bottom-0 left-0 h-0.5 w-full"></div>
    </nav>
  );
}

export default Navbar;