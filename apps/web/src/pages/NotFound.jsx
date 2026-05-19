import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                        <AlertTriangle className="text-red-400" size={48} />
                    </div>
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-red-400 mb-2">
                        404
                    </h1>
                    <h2 className="text-3xl font-bold text-text-primary mb-3">Page Not Found</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-text-primary font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-slate-300 font-semibold rounded-xl border border-[#334155] transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                <p className="mt-8 text-slate-600 text-sm">
                    Bloody Roar Platform — Bug Bounty & Freelance
                </p>
            </div>
        </div>
    );
};

export default NotFound;
