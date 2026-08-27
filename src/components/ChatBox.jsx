import { useState, useRef, useEffect } from 'react'

function ChatBox({ messages, onSend, loading }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || loading) return;
    onSend(t);
    setText('');
  };

  const suggestions = ['Why is RSI at that level?', 'What does the volume tell us?', 'Explain the range position'];

  return (
    <div className="cyber-card mt-4 rounded-lg border border-cyan/20 bg-panel p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-4 w-1 rounded-full" style={{ background: '#ff2bd6', boxShadow: '0 0 8px #ff2bd6' }} />
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-magenta">Ask the Analyst</h2>
        <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg,#ff2bd655,transparent)' }} />
      </div>

      <div className="mb-3 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="space-y-2">
            <div className="text-xs text-sub">Ask a follow-up about this coin, grounded in the indicators above.</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => onSend(s)} disabled={loading}
                  className="rounded border border-cyan/20 px-2.5 py-1 text-xs text-sub transition hover:border-cyan/50 hover:text-cyan disabled:opacity-50">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className={`mr-2 text-[10px] font-bold uppercase tracking-wider ${m.role === 'user' ? 'text-cyan' : 'text-magenta'}`}>
              {m.role === 'user' ? 'You' : 'AI'}
            </span>
            <span className={m.role === 'user' ? 'text-ink' : 'text-sub'}>{m.text}</span>
          </div>
        ))}

        {loading && (
          <div className="text-sm">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-magenta">AI</span>
            <span className="text-sub">thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about this coin…"
          className="flex-1 rounded border border-cyan/30 bg-bg/40 px-3 py-2 text-sm text-ink outline-none placeholder:text-sub focus:border-cyan"
        />
        <button type="submit" disabled={loading || !text.trim()}
          className="rounded border border-magenta/40 bg-magenta/10 px-4 py-2 text-sm text-magenta transition hover:bg-magenta/20 active:scale-95 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
