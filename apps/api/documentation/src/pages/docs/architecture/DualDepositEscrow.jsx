import React from 'react';
import { Briefcase, ArrowRightLeft, Clock, ShieldCheck, Scale } from 'lucide-react';

const DualDepositEscrow = () => {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Dual-Deposit Escrow</h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    To eliminate counterparty risk and ensure skin in the game, Bloody Roar uses a sophisticated
                    Dual-Deposit Smart Contract system deployed on our blockchain network.
                </p>
            </div>

            <div className="mt-12 bg-bg-elevated border border-border rounded-2xl p-1 overflow-hidden">
                <div className="bg-[#0a0a0a] rounded-xl p-8">
                    <h3 className="text-xl font-bold text-text-primary mb-6">How It Works</h3>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-blue-500/20 text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                                <Briefcase size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#111] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-text-primary">Step 1: Client Deposit</h4>
                                </div>
                                <p className="text-sm text-text-secondary">The client locks the exact bounty amount in the smart contract to prove liquidity.</p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-purple-500/20 text-purple-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                                <ShieldCheck size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#111] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-text-primary">Step 2: Developer Stake</h4>
                                </div>
                                <p className="text-sm text-text-secondary">The selected developer deposits a fractional stake (e.g., 5-10%) as a commitment guarantee to prevent job abandonment.</p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-green-500/20 text-green-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                                <ArrowRightLeft size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#111] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-text-primary">Step 3: Delivery & Release</h4>
                                </div>
                                <p className="text-sm text-text-secondary">Upon successful Sandbox execution and client approval, both the bounty and the developer's original stake are released to the developer.</p>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-red-500/20 text-red-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                                <Scale size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#111] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-text-primary">Step 4: Dispute Resolution</h4>
                                </div>
                                <p className="text-sm text-text-secondary">If a dispute arises, the funds remain locked while the AI Dispute Assistant analyzes the logs and notifies Human Arbiters.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DualDepositEscrow;
