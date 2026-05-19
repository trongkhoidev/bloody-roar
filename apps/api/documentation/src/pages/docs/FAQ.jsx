import React from 'react';

const FAQ = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">FAQ</h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                    Common questions about Bloody Roar.
                </p>
            </div>

            <div className="space-y-4">
                {[
                    { q: "What is Bloody Roar?", a: "A decentralized bounty marketplace where you can earn crypto by contributing to open-source projects." },
                    { q: "Do I need to pay to sign up?", a: "No, signing up is free. We only charge a small fee on successful bounty payments." },
                    { q: "What wallets are supported?", a: "We currently support MetaMask and any WalletConnect compatible wallet." },
                    { q: "How are disputes handled?", a: "If a client and developer disagree, the funds remain locked until a community arbitrator resolves the dispute." }
                ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-bg-elevated border border-border">
                        <h4 className="font-semibold text-text-primary mb-2">{item.q}</h4>
                        <p className="text-sm text-text-secondary">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
