import React from 'react';
import { Bot, Scale, Search, ShieldAlert, Cpu } from 'lucide-react';

const AiDisputeAssistant = () => {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">AI Dispute Assistant</h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    Resolving conflicts shouldn't take weeks. Bloody Roar uses an advanced LLM-powered Assistant
                    to parse logs, analyze code diffs, and pre-digest evidence for human Arbiters.
                </p>
            </div>

            <div className="mt-12 bg-[#111] border border-border rounded-2xl p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                            <div className="relative w-32 h-32 bg-bg-primary border border-border rounded-full flex items-center justify-center shadow-2xl">
                                <Bot size={48} className="text-red-400" />
                            </div>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#111] border border-border rounded-full flex items-center justify-center animate-bounce">
                                <Search size={14} className="text-text-secondary" />
                            </div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#111] border border-border rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                                <Code size={14} className="text-text-secondary" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <h3 className="text-2xl font-bold text-text-primary">Automated Evidence Gathering</h3>
                        <p className="text-text-secondary leading-relaxed">
                            When a dispute is raised, the Escrow is paused. The AI Dispute Assistant immediately executes a prompt chain to gather context from the entire project lifecycle:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-text-primary">
                                <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                                    <Cpu size={12} className="text-blue-400" />
                                </div>
                                System architecture logs and GitHub diff histories.
                            </li>
                            <li className="flex items-center gap-3 text-sm text-text-primary">
                                <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                                    <MessageCircle size={12} className="text-green-400" />
                                </div>
                                Chatbox communication history (verifying feature commitments vs delivery).
                            </li>
                            <li className="flex items-center gap-3 text-sm text-text-primary">
                                <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                                    <ShieldAlert size={12} className="text-red-400" />
                                </div>
                                FingerprintJS anomaly detection for multi-accounting or fraudulent client behavior.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl flex gap-4">
                <Scale className="text-blue-400 shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-bold text-text-primary mb-1">Human-in-the-Loop Arbitration</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        The AI does not make the final financial decision. Instead, it generates a comprehensive "Dispute Dossier" that highlights the breach of contract, failed tests, or toxic communication. The Admin dashboard presents this dossier to human Arbiters who make the final Smart Contract Slashing or Releasing transaction.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiDisputeAssistant;

function Code(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>; }
function MessageCircle(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>; }
