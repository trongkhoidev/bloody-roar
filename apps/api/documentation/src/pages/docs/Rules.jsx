import React from 'react';

const Rules = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Platform Rules</h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                    Guidelines to ensure a fair and safe environment for everyone.
                </p>
            </div>

            <div className="space-y-4">
                <div className="p-5 rounded-lg border border-red-500/20 bg-red-500/5">
                    <h3 className="text-lg font-bold text-red-200 mb-2">🚫 Prohibited Behavior</h3>
                    <ul className="list-disc pl-5 space-y-1 text-red-200/70 text-sm">
                        <li>Submitting malicious or obfuscated code.</li>
                        <li>Attempting to bypass the escrow system.</li>
                        <li>Harassment or abusive language.</li>
                        <li>Creating multiple accounts to manipulate reputation.</li>
                    </ul>
                </div>

                <div className="p-5 rounded-lg border border-green-500/20 bg-green-500/5">
                    <h3 className="text-lg font-bold text-green-200 mb-2">✅ Best Practices</h3>
                    <ul className="list-disc pl-5 space-y-1 text-green-200/70 text-sm">
                        <li>Communicate clearly and frequently.</li>
                        <li>Respect deadlines.</li>
                        <li>Write clean, documented code.</li>
                        <li>Provide constructive feedback.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Rules;
