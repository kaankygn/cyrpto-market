import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="font-display text-4xl font-bold text-down" style={{ textShadow: '0 0 10px rgba(255,59,107,0.6)' }}>
            SYSTEM FAULT
          </div>
          <p className="max-w-md text-sm text-sub">
            Something glitched while rendering this view. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:bg-cyan/20 active:scale-95"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
