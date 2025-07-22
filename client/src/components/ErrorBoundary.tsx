import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              maxWidth: '500px',
            }}
          >
            <h1 style={{ color: '#e74c3c', marginBottom: '1rem' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details (Development)
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
