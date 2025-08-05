import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        // You can also log the error to an error reporting service here
        // Example: Sentry.captureException(error, { extra: errorInfo });

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                            <CardDescription>
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env.DEV && this.state.error && (
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="flex-1"
                                >
                                    Refresh Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 