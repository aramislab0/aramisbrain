'use client';

import { useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    model?: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [model, setModel] = useState<'gpt4' | 'claude'>('claude');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, model })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                model: data.model
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `❌ Erreur : ${error.message}. Vérifiez que les API keys sont configurées dans .env.local`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg h-[calc(100vh-200px)] flex flex-col">
            {/* Header avec Model Switcher */}
            <div className="p-4 border-b border-gold-primary/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">🤖 Dialogue IA Executive</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setModel('claude')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${model === 'claude'
                                ? 'bg-gold-primary text-bg-primary'
                                : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Claude
                    </button>
                    <button
                        onClick={() => setModel('gpt4')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${model === 'gpt4'
                                ? 'bg-gold-primary text-bg-primary'
                                : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        GPT-4
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-text-secondary py-12">
                        <p className="mb-2 text-gold-primary font-semibold">💬 Pose une question stratégique</p>
                        <p className="text-sm">Le contexte de tous tes projets sera injecté automatiquement</p>
                        <div className="mt-6 text-xs bg-bg-primary border border-gold-primary/20 rounded p-4 max-w-2xl mx-auto text-left">
                            <p className="text-gold-primary font-semibold mb-2">Exemples de questions :</p>
                            <ul className="space-y-1 text-text-secondary">
                                <li>• Quel projet dois-je prioriser cette semaine ?</li>
                                <li>• Dois-je lancer un nouveau projet ou finir SIRA ?</li>
                                <li>• Comment réduire le risque de dispersion ?</li>
                                <li>• Résume mes projets à risque</li>
                            </ul>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-bg-primary text-text-primary border border-gold-primary/20'
                                    : 'bg-gold-primary/10 text-text-primary border border-gold-primary/20'
                                }`}
                        >
                            {msg.role === 'assistant' && msg.model && (
                                <p className="text-xs text-gold-primary mb-2 font-mono">
                                    {msg.model === 'gpt4' ? '🤖 GPT-4' : '🧠 Claude Sonnet 4'}
                                </p>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gold-primary/10 border border-gold-primary/20 rounded-lg px-4 py-3">
                            <p className="text-text-secondary animate-pulse">⚙️ Réflexion en cours...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gold-primary/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Demande conseil stratégique..."
                        className="flex-1 bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="bg-gold-primary text-bg-primary px-6 py-3 rounded font-medium hover:bg-gold-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
}
