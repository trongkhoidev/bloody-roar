import React from 'react';
import { Code, Terminal, Server, Bot, EyeOff } from 'lucide-react';

const SandboxExecution = () => {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Sandbox Execution</h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    Bloody Roar provisions dynamic, isolated Kubernetes/Docker environments to securely test, verify,
                    and review code before final escrow release.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex flex-col items-start">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl mb-4">
                        <Terminal size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Code-Server IDE</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Integrated Web IDEs allow reviewers to jump into the container, inspect the codebase, and run commands
                        in a minimal reproducible environment without cloning repositories locally.
                    </p>
                </div>

                <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex flex-col items-start">
                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl mb-4">
                        <Server size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Automated CI/CD</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Upon PR submission, CI/CD listeners trigger automated tests. Oracle relayers can optionally
                        push test success/failure metrics directly to the Smart Contract.
                    </p>
                </div>

                <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex flex-col items-start">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl mb-4">
                        <EyeOff size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Asymmetric Visibility</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        To protect intellectual property, submitted code in the sandbox can be verified by tests without giving
                        the client full repository access until the escrow is formally released.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SandboxExecution;
