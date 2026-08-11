import { useEffect, useRef } from 'react'

function Loading() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const x = c.getContext('2d');
        const chars = '01アイウエオカキ₿BTC$';
        const fs = 14;
        let drops, speeds;
        const reset = () => {
            c.width = c.offsetWidth;
            c.height = c.offsetHeight;
            const cols = Math.floor(c.width / fs);
            drops = Array(cols).fill(0).map(() => (Math.random() * -c.height) / fs);
            speeds = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.8);
        };
        reset();
        window.addEventListener('resize', reset);
        let raf, last = 0;
        const draw = (t) => {
            if (t - last > 45) {
                last = t;
                x.fillStyle = 'rgba(10,10,18,0.10)';
                x.fillRect(0, 0, c.width, c.height);
                x.font = fs + 'px monospace';
                for (let i = 0; i < drops.length; i++) {
                    x.fillStyle = Math.random() < 0.1 ? '#ff2bd6' : '#00e5ff';
                    x.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, drops[i] * fs);
                    if (drops[i] * fs > c.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i] += speeds[i];
                }
            }
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', reset); };
    }, []);

    return (
        <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
            <div className="relative flex flex-col items-center">
                <div className="relative h-[300px] w-[320px]">
                    <div className="loading-portal absolute bottom-12 left-1/2 h-16 w-60 -translate-x-1/2"></div>
                    <div className="loading-suck absolute bottom-20 left-[35%] flex flex-col items-center">
                        <div className="loading-coin">₿</div>
                        <img src="/mascot-fall.png" alt="" className="-mt-2 h-52 w-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))' }} />
                    </div>
                </div>
                <div className="relative mt-8 font-display text-sm tracking-[0.35em] text-cyan glow-cyan">DOWN THE RABBIT HOLE</div>
                <div className="relative mt-2 text-xs tracking-widest text-sub">loading terminal...</div>
            </div>
        </div>
    );
}

export default Loading;