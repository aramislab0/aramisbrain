'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function AIChatPage() {
    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">🤖 Dialogue IA Executive</h1>
                    <p className="text-text-secondary">
                        Conseiller stratégique avec contexte automatique. Switch GPT-4 ↔ Claude.
                    </p>
                </div>

                <ChatInterface />
            </div>
        </div>
    );
}
