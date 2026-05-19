import React from 'react';

const DevelopersGuide = () => {
    return (
        <div className="space-y-12 animate-fade-in pb-10">
            {/* Header */}
            <div className="border-b border-border pb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Guide for Developers</h1>
                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
                    Turn your coding skills into crypto. Learn how to find reliable work, submit quality code, and build your on-chain reputation.
                </p>
            </div>

            {/* Step 1 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm">1</span>
                    Building Your Profile
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        Your profile is your resume. Clients look for reliability and skill verification.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                            <h4 className="text-text-primary font-medium mb-2">Essential Setup</h4>
                            <ul className="text-sm space-y-1">
                                <li>Connect GitHub Account</li>
                                <li>List Top Skills (e.g., React, Solidity)</li>
                                <li>Add a Bio describing your expertise</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                            <h4 className="text-text-primary font-medium mb-2">Reputation System</h4>
                            <p className="text-sm">
                                You start with a base score. Every successful bounty increases your score. Failed or disputed jobs may lower it. High reputation unlocks exclusive, higher-paying bounties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-sm">2</span>
                    Finding & Applying
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        Go to the <strong>Marketplace</strong> to browse open issues. Use filters to find jobs matching your stack.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Read the Description and Acceptance Criteria carefully.</li>
                        <li>Check the <strong>Deadline</strong>. Can you complete it in time?</li>
                        <li>Click <strong>Apply</strong> and write a short note. Explain <em>how</em> you plan to solve the issue.</li>
                    </ul>
                    <p className="italic text-text-muted text-sm">
                        "I can do this" is a weak application. "I will modify the `AuthContext.js` to handle token refresh and update the unit tests" is a strong one.
                    </p>
                </div>
            </section>

            {/* Step 3 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-sm">3</span>
                    Working & Submission
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        Once your application is accepted, the bounty status changes to <strong>In Progress</strong>.
                    </p>
                    <div className="bg-bg-elevated p-6 rounded-xl border border-border">
                        <h4 className="text-text-primary font-bold mb-4">Submission Checklist</h4>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 text-xs">✓</div>
                                <div>
                                    <strong className="text-text-primary">Code Quality:</strong> Clean, commented code following the project's style guide.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 text-xs">✓</div>
                                <div>
                                    <strong className="text-text-primary">Testing:</strong> Ensure your changes pass all local tests.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 text-xs">✓</div>
                                <div>
                                    <strong className="text-text-primary">PR Link:</strong> Push your code to a branch and open a Pull Request. Copy the PR link.
                                </div>
                            </div>
                        </div>
                    </div>
                    <p>
                        Paste your PR link in the "Submit Work" modal on the dashboard.
                    </p>
                </div>
            </section>

            {/* Step 4 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-sm">4</span>
                    Getting Paid
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        When the client approves your work, the smart contract executes immediately.
                    </p>
                    <ul className="list-disc pl-5">
                        <li>Funds appear in your connected wallet.</li>
                        <li>The transaction is recorded on-chain.</li>
                        <li>Your platform reputation increases.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default DevelopersGuide;
