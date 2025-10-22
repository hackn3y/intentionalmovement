import React from 'react';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service if available
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We&apos;re sorry for the inconvenience. An error occurred while rendering this component.
              </p>

              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mt-8">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 overflow-auto">
                    <p className="text-sm font-mono text-red-900 dark:text-red-300 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-red-800 dark:text-red-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
