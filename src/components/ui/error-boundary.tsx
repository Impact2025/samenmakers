"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic error boundary that catches render errors inside its subtree.
 * Use it around individual features/pages instead of letting the error
 * bubble up to the global error.tsx.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyFeature />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<CustomFallback />}>
 *     <MyFeature />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("[ErrorBoundary]", error.message, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-sm text-center">
        <p className="text-outline/10 mb-4 text-[80px] leading-none font-black select-none">
          !
        </p>
        <h2 className="text-on-surface mb-2 text-xl font-black">
          Er ging iets mis
        </h2>
        <p className="text-on-surface-variant mb-4 text-sm">
          Dit onderdeel kon niet worden geladen. Probeer de pagina te verversen.
        </p>
        {process.env.NODE_ENV === "development" && error && (
          <pre className="mb-4 max-h-32 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-left text-xs">
            {error.name}: {error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-colors"
        >
          Pagina verversen
        </button>
      </div>
    </div>
  );
}
