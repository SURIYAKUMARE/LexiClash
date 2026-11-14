import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SkillPath UI Runtime Uncaught Exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('SkillPathOfflineDB');
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Self-Healing Safe Mode
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Workspace Render State Recovered
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                SkillPath encountered an unexpected client-side state irregularity. Your local data remains safely persisted in IndexedDB.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5C7A] hover:bg-[#0c4a63] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/login'; }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Portal Home
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                title="Clears local storage and re-seeds fresh database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
