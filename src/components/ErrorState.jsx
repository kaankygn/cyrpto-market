import { useState, useEffect, useRef } from 'react'

const TARGET = 'SIGNAL LOST';
const GLYPHS = '!<>-_\\/[]{}=+*#%&@?01';

function ErrorState({ message = 'Connection failed', onRetry }) {
  const [text, setText] = useState(TARGET);
  const raf = useRef();

  useEffect(() => {
    const scramble = () => {
      let start;
      const step = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / 600, 1);
        const resolved = Math.floor(p * TARGET.length);
        setText(TARGET.split('').map((ch, i) =>
          ch === ' ' ? ' ' : i < resolved ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ).join(''));
        if (p < 1) raf.current = requestAnimationFrame(step);
        else setText(TARGET);
      };
      raf.current = requestAnimationFrame(step);
    };
    const timer = setInterval(scramble, 2500);
    return () => { clearInterval(timer); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/mascot-error.png" alt="" className="err-glitch h-40 w-auto"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,59,107,0.6))' }} />
      <div data-text={text} className="glitch-text font-display text-2xl font-bold tracking-widest text-down"
        style={{ textShadow: '0 0 10px rgba(255,59,107,0.6)' }}>
        {text}
      </div>
      <div className="max-w-md text-sm text-sub">{message}</div>
      <button onClick={onRetry ?? (() => window.location.reload())}
        className="mt-2 rounded border border-cyan/40 px-5 py-2 text-sm text-cyan transition-colors hover:bg-cyan/10">
        ⟳ RETRY CONNECTION
      </button>
    </div>
  );
}

export default ErrorState;