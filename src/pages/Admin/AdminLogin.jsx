import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const ADMIN_CREDENTIALS = {
        username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
        password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            if (credentials.username === ADMIN_CREDENTIALS.username &&
                credentials.password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminUsername', credentials.username);
                navigate('/admin/dashboard');
            } else {
                setError('Invalid username or password');
            }
            setLoading(false);
        }, 500);
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-indigo-500/30">
                        <Shield className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400 text-lg">Bloody Roar Platform</p>
                    <div className="mt-4 inline-block px-4 py-1.5 bg-indigo-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20">
                        <p className="text-sm text-indigo-400">Secure Admin Access</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-[#1e293b] backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#334155]">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Sign in to access the admin dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-red-400 font-medium text-sm">Authentication Failed</p>
                                <p className="text-red-400/80 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-slate-500" size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-slate-500" size={20} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    Authenticating...
                                </span>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#334155]">
                        <div className="bg-[#0f172a] rounded-xl p-4 border border-[#334155]">
                            <p className="text-xs text-slate-400 text-center leading-relaxed flex items-center justify-center gap-1">
                                <Shield size={14} className="text-indigo-400" />
                                Protected area - Authorized personnel only
                            </p>
                            <p className="text-xs text-slate-500 text-center mt-2">
                                Need help? Contact system administrator
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        Bloody Roar Platform {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
