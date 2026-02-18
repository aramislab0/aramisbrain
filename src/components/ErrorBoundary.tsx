'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-danger/10 border border-danger/20 rounded-card p-8 text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-danger mb-2">
                            Une erreur est survenue
                        </h2>
                        <p className="text-sm text-text-secondary mb-6">
                            {this.state.error?.message || 'Erreur inconnue'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary px-6 py-3"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
