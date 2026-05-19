import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Introduction = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Introduction</h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                    Bloody Roar is a decentralized marketplace that connects skilled freelancers with clients through secure smart contracts.
                </p>
            </div>

            <div className="prose  max-w-none prose-p:text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary">
                <h2>Why Bloody Roar?</h2>
                <p>
                    Traditional freelancing platforms charge high fees and hold payments for days. Bloody Roar leverages Ethereum smart contracts to ensure fairness, transparency, and instant payments.
                </p>

                <h3>Key Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                    {[
                        "Escrow-based Payments",
                        "Reputation System",
                        "Instant Withdrawals",
                        "Decentralized Dispute Resolution"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 p-3 rounded bg-bg-elevated border border-border text-sm text-text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-4 pt-4">
                <Link to="/docs/clients-guide" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-bg-elevated text-text-primary font-medium hover:bg-bg-elevated transition-colors">
                    I'm a Client <ArrowRight size={16} />
                </Link>
                <Link to="/docs/developers-guide" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-bg-elevated text-text-primary font-medium hover:bg-bg-elevated transition-colors">
                    I'm a Developer <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
};

export default Introduction;
