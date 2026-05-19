import React from 'react';
import { Shield, Smartphone, Key, Fingerprint, Lock } from 'lucide-react';

const EkycIdentity = () => {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">eKYC & Identity (SBTs)</h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    Our unified platform implements robust Know Your Customer (eKYC) compliance using modern web standards
                    and Soulbound Tokens (SBTs). This ensures trust and prevents sybil attacks while maintaining privacy.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
                <div className="bg-bg-elevated border border-border p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
                        <Smartphone size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Cross-Device Handshake</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        We support mobile-to-PC handshake using secure WebSockets. Users can scan a QR code on their desktop
                        to seamlessly complete identity verification on their mobile devices equipped with superior cameras.
                    </p>
                </div>

                <div className="bg-bg-elevated border border-border p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 border border-green-500/20">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Soulbound Tokens (SBTs)</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Once verified via our webhook endpoint, the smart contract mints an immutable Soulbound Token to the
                        user's wallet, granting full platform access without retaining raw personal identifiable information (PII).
                    </p>
                </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-2xl p-8 mt-12">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Liveness Detection & Fingerprinting</h2>
                <div className="space-y-6 text-text-secondary">
                    <p>
                        We use advanced <strong className="text-text-primary">Liveness Detection</strong> (such as Persona/Sumsub SDKs) to ensure the physical
                        presence of the user during onboarding, effectively combating deepfakes and spoofing.
                    </p>
                    <p>
                        Additionally, <strong className="text-text-primary">FingerprintJS</strong> is integrated into the web client to assign unique device identifiers
                        tied to user accounts, helping our AI Dispute Assistant flag fraudulent or suspicious multi-account activities.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EkycIdentity;
