import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback;
      if (fallback) {
        return typeof fallback === "function"
          ? fallback({ error: this.state.error, errorInfo: this.state.errorInfo })
          : fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-3xl bg-white p-8 shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ocorreu um erro</h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || "Erro inesperado no painel."}
            </p>
            <pre className="text-xs text-left text-gray-500 overflow-auto max-h-48">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
