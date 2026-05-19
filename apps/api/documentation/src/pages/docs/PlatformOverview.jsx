import React from 'react';

const PlatformOverview = () => {
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Platform Overview</h1>
                <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">
                    Bloody Roar is a Web3-native freelancer marketplace. We replace traditional middlemen with verifiable code, ensuring <strong>trustless</strong> cooperation between clients and developers.
                </p>
            </div>

            <div className="grid gap-12">
                <section>
                    <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-border pb-2">Core Architecture</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-purple-400 mb-3">Hybrid Decentralization</h3>
                            <p className="text-text-secondary leading-relaxed">
                                We utilize a hybrid approach for optimal user experience and security:
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 bg-white rounded-full" /> <strong>On-Chain:</strong> Payments, Escrow, Reputation scoring.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 bg-white rounded-full" /> <strong>Off-Chain:</strong> User profiles, Job descriptions, Chat history (IPFS/Database).</li>
                            </ul>
                        </div>
                        <div className="bg-bg-elevated p-6 rounded-xl border border-border">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Solidity', 'Hardhat', 'Ethers.js'].map(tech => (
                                    <span key={tech} className="px-3 py-1 bg-bg-primary rounded border border-border-hover text-xs text-text-primary">{tech}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-border pb-2">The Escrow Mechanism</h2>
                    <p className="text-text-secondary mb-6">
                        The heart of Bloody Roar is the Bounty Escrow Smart Contract. It acts as an impartial third party holding funds.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="p-6 bg-bg-elevated rounded-xl border border-border relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <h4 className="font-bold text-text-primary mt-2 mb-2">Lock</h4>
                            <p className="text-sm text-text-secondary">Client deposits ETH into the contract upon hiring.</p>
                        </div>
                        <div className="p-6 bg-bg-elevated rounded-xl border border-border relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <h4 className="font-bold text-text-primary mt-2 mb-2">Verify</h4>
                            <p className="text-sm text-text-secondary">Developer works. Client verifies the output.</p>
                        </div>
                        <div className="p-6 bg-bg-elevated rounded-xl border border-border relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                            <h4 className="font-bold text-text-primary mt-2 mb-2">Release</h4>
                            <p className="text-sm text-text-secondary">Funds are released to Developer (or returned if disputted).</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PlatformOverview;
