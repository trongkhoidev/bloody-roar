import React, { useEffect, useState } from "react";
import { useAuth } from "@app/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, LogIn, Loader2 } from "lucide-react";

const Login = () => {
    const { login, user, isLoading } = useAuth();
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
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <img src="/image/logo.png" alt="Bloody Roar" className="w-12 h-12 rounded-full object-cover shadow-lg shadow-blue-500/10" />
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Bloody Roar</h1>
                    <p className="text-xs text-text-muted">Web3 Bounty Platform</p>
                </div>
            </div>

            {/* Card */}
            <div className="bg-bg-secondary p-8 rounded-2xl border border-border max-w-md w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
                    <p className="text-text-muted text-sm">Sign in to continue to your account</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleWeb2Login} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-text-muted" />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-text-muted" />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[14px]"
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

                    <div className="text-center text-sm pt-2">
                        <span className="text-text-muted">Don't have an account? </span>
                        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
