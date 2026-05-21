import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log error messages to an error reporting service here
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI passed as a prop, or a default one
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
          <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="text-lg mb-4">We're sorry for the inconvenience. Please try again later.</p>
          {this.state.error && (
            <details className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-4">
              <summary>Error Details</summary>
              <pre className="whitespace-pre-wrap break-all">{this.state.error.message}</pre>
              {/* <pre className="whitespace-pre-wrap break-all">{this.state.error.stack}</pre> */} {/* Stack can be very verbose */}
            </details>
          )}
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;