import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedoAlt } from 'react-icons/fa';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary to prevent full application crashes
 * when a child component throws an unhandled error during render.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to reporting services in prod
        console.error('Uncaught error in component:', error, errorInfo);
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); // Hard reload is usually safest after a crash
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            We're sorry, but an unexpected error occurred while rendering this page.
                        </p>

                        {/* Optional: Show technically detailed error only in dev */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-slate-100 p-4 rounded-md text-left mb-6 overflow-x-auto">
                                <p className="text-xs font-mono text-red-600 break-words">{this.state.error.toString()}</p>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-medium cursor-pointer"
                        >
                            <FaRedoAlt className="mr-2" /> Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
