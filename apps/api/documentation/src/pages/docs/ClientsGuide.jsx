import React from 'react';

const ClientsGuide = () => {
    return (
        <div className="space-y-12 animate-fade-in pb-10">
            {/* Header */}
            <div className="border-b border-border pb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Guide for Clients</h1>
                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
                    Everything you need to know about posting bounties, hiring talent, and securely managing payments on Bloody Roar.
                </p>
            </div>

            {/* Step 1 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm">1</span>
                    Getting Started
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        Before you can post a job, you need to connect your Web3 wallet. We support <strong>MetaMask</strong> and other simplified wallet providers.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Install the MetaMask browser extension.</li>
                        <li>Click <strong>Connect Wallet</strong> in the top right corner of the platform.</li>
                        <li>Sign the authentication request (no gas fee required for login).</li>
                    </ul>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-4">
                        <p className="text-sm text-blue-200">
                            <strong>Note:</strong> You will need ETH (Sepolia Testnet or Mainnet depending on environment) to fund your bounties.
                        </p>
                    </div>
                </div>
            </section>

            {/* Step 2 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-sm">2</span>
                    Posting a Bounty
                </h2>
                <div className="pl-11 space-y-6 text-text-secondary">
                    <p>
                        To attract the best talent, your job post needs to be clear and detailed. Navigate to your <strong>Dashboard</strong> and select <strong>"Post Bounty"</strong>.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-bg-elevated border border-border">
                            <h3 className="text-text-primary font-semibold mb-2">Required Fields</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><span className="text-purple-400">●</span> <strong>Title:</strong> Concise summary (e.g., "Fix React Re-render Bug").</li>
                                <li className="flex gap-2"><span className="text-purple-400">●</span> <strong>Category:</strong> Web, Mobile, Smart Contracts, etc.</li>
                                <li className="flex gap-2"><span className="text-purple-400">●</span> <strong>Description:</strong> detailed requirements and acceptance criteria.</li>
                                <li className="flex gap-2"><span className="text-purple-400">●</span> <strong>Reward:</strong> Amount in ETH.</li>
                            </ul>
                        </div>
                        <div className="p-5 rounded-xl bg-bg-elevated border border-border">
                            <h3 className="text-text-primary font-semibold mb-2">Pro Tips</h3>
                            <p className="text-sm leading-relaxed">
                                Include links to your repository or design files (Figma).
                                Be specific about the deliverables. "Fix bugs" is vague; "Resolve Issue #402 regarding login timeout" is clear.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 3 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-sm">3</span>
                    Selecting a Candidate
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        Developers will apply to your bounty. You will receive notifications for new applications.
                    </p>
                    <div className="prose  max-w-none">
                        <h4>What to look for:</h4>
                        <ul>
                            <li><strong>Reputation Score:</strong> Based on previous successful completions.</li>
                            <li><strong>GitHub Activity:</strong> Verification of their coding history.</li>
                            <li><strong>Cover Letter:</strong> Their proposed approach to your problem.</li>
                        </ul>
                    </div>
                    <p>
                        When you click <strong>Accept</strong> on a candidate, the <strong>Escrow Process</strong> begins. You will be prompted to deposit the bounty amount into the smart contract.
                    </p>
                </div>
            </section>

            {/* Step 4 */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-sm">4</span>
                    Review & Payment
                </h2>
                <div className="pl-11 space-y-4 text-text-secondary">
                    <p>
                        The developer will work on the task and submit a Pull Request (PR) or a proof of work link.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 marker:text-text-muted">
                        <li>Review the code/deliverable.</li>
                        <li>Request changes if it doesn't meet requirements.</li>
                        <li>If satisfied, click <strong>Approve & Pay</strong>.</li>
                    </ol>
                    <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 mt-4">
                        <p className="text-sm text-green-200">
                            <strong>Instant Settlement:</strong> The moment you approve, the smart contract unlocks the funds and transfers them directly to the developer. No admin delays.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ClientsGuide;
