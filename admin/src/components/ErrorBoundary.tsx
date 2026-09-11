import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Copy, Check } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an unhandled error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleReload = () => {
    window.location.reload();
  };

  public handleCopyDetails = () => {
    const details = `Error: ${this.state.error?.message || "Unknown"}\n\nStack:\n${
      this.state.error?.stack || ""
    }\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ""}`;
    navigator.clipboard.writeText(details);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 bg-paper/50">
          <div className="w-full max-w-xl bg-white border border-red-200 rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-bold text-lg text-ink">
                {this.props.fallbackTitle || "An unexpected error occurred"}
              </h2>
              <p className="text-xs text-steel max-w-md mx-auto leading-relaxed">
                The application encountered an issue while rendering this view. Your session is safe,
                and you can try recovering by clicking the buttons below.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-paper hover:bg-black/5 text-ink border border-black/10 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </button>
            </div>

            {(isDev || this.state.error) && (
              <div className="mt-6 pt-4 border-t border-black/10 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-steel font-semibold uppercase tracking-wider">
                    Error Diagnostic
                  </span>
                  <button
                    type="button"
                    onClick={this.handleCopyDetails}
                    className="text-[11px] text-steel hover:text-ink inline-flex items-center gap-1 transition-colors"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Details
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs font-mono overflow-x-auto max-h-48 scrollbar-thin">
                  <p className="font-semibold text-rose-400 mb-1">
                    {this.state.error?.name}: {this.state.error?.message}
                  </p>
                  {this.state.error?.stack && (
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[10px] text-slate-500 whitespace-pre-wrap mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
