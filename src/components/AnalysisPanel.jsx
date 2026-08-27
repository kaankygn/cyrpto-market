function AnalysisPanel({ analysis, rangeLabel }) {
    if (!analysis) return null;
    const { bias, confidence, signals, anomalies, from, to, bars } = analysis;
    const fmtD = (t) => new Date(t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const biasColor = bias === 'bullish' ? 'text-up' : bias === 'bearish' ? 'text-down' : 'text-sub';
    const biasBg = bias === 'bullish' ? 'border-up/40 bg-up/10' : bias === 'bearish' ? 'border-down/40 bg-down/10' : 'border-cyan/30 bg-cyan/5';
    const tone = (t) => (t === 'up' ? 'text-up' : t === 'down' ? 'text-down' : 'text-ink');
    const pct = (confidence * 100).toFixed(0);

    return (
        <div className="cyber-card mt-4 rounded-lg border border-cyan/20 bg-panel p-4">
            <div className="mb-3 flex items-center gap-3">
                <span className="h-4 w-1 rounded-full" style={{ background: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cyan glow-cyan">Signal Analysis</h2>
                <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg,#00e5ff55,transparent)' }} />
            </div>

            <div className="mb-3 text-[11px] text-sub">
                Interval <span className="text-ink">{rangeLabel}</span> · {bars} bars · {fmtD(from)} → {fmtD(to)}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4">
                <span className={`rounded border px-3 py-1 text-sm font-bold uppercase tracking-wider ${biasBg} ${biasColor}`}>{bias}</span>
                <div className="flex items-center gap-2 text-xs text-sub">
                    <span>confidence</span>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-cyan/10">
                        <div className="h-full rounded-full bg-cyan" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="tabular-nums text-ink">{pct}%</span>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {signals.map((s) => (
                    <div key={s.label} className="rounded border border-cyan/15 bg-bg/40 p-2">
                        <div className="text-[10px] uppercase tracking-wider text-sub">{s.label}</div>
                        <div className={`text-sm font-semibold tabular-nums ${tone(s.tone)}`}>{s.value}</div>
                        <div className="text-[11px] text-sub">{s.note}</div>
                    </div>
                ))}
            </div>

            {anomalies.length > 0 && (
                <div className="mb-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-magenta">Anomalies</div>
                    <ul className="space-y-1">
                        {anomalies.map((a, i) => (
                            <li key={i} className="flex gap-2 text-sm text-ink"><span className="text-magenta">▹</span>{a}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="rounded border border-cyan/15 bg-bg/40 p-3 text-xs text-sub">
                <span className="text-ink">Outlook:</span> signals lean <span className={biasColor}>{bias}</span> for the near term (confidence {pct}%).
                Rule-based, data-driven signal summary — <span className="text-sub">not financial advice.</span>
            </div>
        </div>
    );
}

export default AnalysisPanel;