import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background p-4 text-center">
                    <div className="card max-w-md w-full p-8">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted mb-6">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={handleReset}
                        >
                            Back to Home
                        </button>
                        {process.env.NODE_ENV !== 'production' && (
                            <pre className="mt-6 text-left text-xs bg-muted p-4 rounded overflow-auto max-h-40">
                                {this.state.error?.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
