
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ShieldCheck, Mail, Lock, LogIn } from "lucide-react";

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
        // if success, useEffect will redirect
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                </div>

                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-6">
                    Sign in to your account
                </p>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-2 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleWeb2Login} className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 border py-2 text-sm"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 border py-2 text-sm"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                    >
                        <LogIn size={18} />
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link to="/signup" className="text-red-600 hover:text-red-500 font-medium">
                            Sign up
                        </Link>
                    </div>
                </form>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        onClick={loginWithWeb3}
                        className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all font-semibold active:scale-95 shadow-lg"
                    >
                        <Wallet size={20} />
                        Connect Wallet
                    </button>
                    <p className="mt-2 text-xs text-gray-400">Anonymous & Decentralized</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
