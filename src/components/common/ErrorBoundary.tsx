import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // TODO: Send to error tracking service (e.g., Sentry)
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'black' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '24px' }}>
                        Please refresh the page and try again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(to right, #FFB6C1, #FF69B4)',
                            color: 'black',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '9999px',
                            cursor: 'pointer'
                        }}
                    >
                        Refresh Page
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <pre style={{
                            marginTop: '24px',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            textAlign: 'left',
                            maxWidth: '100%',
                            overflow: 'auto',
                            color: '#e53e3e'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
