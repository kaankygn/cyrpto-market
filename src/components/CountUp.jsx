import { useState, useEffect, useRef } from 'react'

function CountUp({ value, format = (n) => n.toLocaleString(), duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();

  useEffect(() => {
    let start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{format(display)}</>;
}

export default CountUp;