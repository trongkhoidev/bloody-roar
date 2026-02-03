import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ShieldCheck, Mail, Lock, LogIn, Zap, Loader2 } from "lucide-react";

const Login = () => {
    const { loginWithWeb3, login, user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleWeb2Login = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const res = await login(email, password);
        if (!res.success) {
            setError(res.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Zap size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Bloody Roar</h1>
                    <p className="text-xs text-slate-400">Web3 Bounty Platform</p>
                </div>
            </div>

            {/* Card */}
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-[#334155] max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Sign in to continue to your account</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleWeb2Login} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-slate-400">Don't have an account? </span>
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </div>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#334155]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#1e293b] px-3 text-slate-500">Or continue with</span>
                    </div>
                </div>

                {/* Web3 Login */}
                <button
                    onClick={loginWithWeb3}
                    className="w-full flex items-center justify-center gap-3 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-white py-4 px-6 rounded-xl font-semibold transition-all"
                >
                    <Wallet size={20} className="text-amber-400" />
                    Connect Wallet
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                    Anonymous & Decentralized Authentication
                </p>
            </div>
        </div>
    );
};

export default Login;
