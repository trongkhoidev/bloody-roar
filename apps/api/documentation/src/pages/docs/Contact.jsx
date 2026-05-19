import React from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Support</h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                    Need help? Our team is available 24/7 to assist with disputes, bug reports, and general inquiries.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Discord */}
                <div className="p-8 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-[#5865F2] flex items-center justify-center text-text-primary mb-6 group-hover:scale-110 transition-transform">
                        <MessageCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Discord</h3>
                    <p className="text-text-secondary mb-6 text-sm">Join our community server for real-time support and community dispute resolution.</p>
                    <div className="inline-block px-4 py-2 rounded-lg bg-bg-secondary/50 border border-border text-[#5865F2] font-mono font-medium">
                        trongkhoidev
                    </div>
                </div>

                {/* Telegram */}
                <div className="p-8 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/20 hover:bg-[#229ED9]/20 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-[#229ED9] flex items-center justify-center text-text-primary mb-6 group-hover:scale-110 transition-transform">
                        <Send size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Telegram</h3>
                    <p className="text-text-secondary mb-6 text-sm">Direct message our support bot or channel admins for urgent account issues.</p>
                    <div className="inline-block px-4 py-2 rounded-lg bg-bg-secondary/50 border border-border text-[#229ED9] font-mono font-medium">
                        @trongkhoidev
                    </div>
                </div>

                {/* Email */}
                <div className="p-8 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-text-primary mb-6 group-hover:scale-110 transition-transform">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Email</h3>
                    <p className="text-text-secondary mb-6 text-sm">For formal business inquiries, partnership proposals, or legal matters.</p>
                    <a href="mailto:trongkhoidev@gmail.com" className="inline-block px-4 py-2 rounded-lg bg-bg-secondary/50 border border-border text-orange-400 font-mono font-medium hover:bg-bg-elevated transition-colors">
                        trongkhoidev@gmail.com
                    </a>
                </div>
            </div>

            <div className="p-8 rounded-2xl bg-bg-elevated border border-border text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Before you reach out...</h3>
                <p className="text-text-secondary max-w-2xl mx-auto mb-8">
                    Please check our comprehensive FAQ page. 90% of account and payment questions are answered there instantly.
                </p>
                <a href="/docs/faq" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-text-primary text-bg-primary font-bold hover:bg-bg-elevated text-text-primary transition-colors">
                    View FAQ
                </a>
            </div>
        </div>
    );
};

export default Contact;
