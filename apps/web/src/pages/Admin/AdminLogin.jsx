import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Server-side admin authentication — credentials verified in database
            // Using /api relative path — works via Vite proxy in dev, and direct in prod
            const { data } = await axios.post('/api/auth/admin/login', credentials);

            if (data.success && data.data.user.role === 'ADMIN') {
                // Store JWT token (same pattern as regular auth)
                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                navigate('/admin/dashboard');
            } else {
                setError('Access denied. Admin role required.');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Authentication failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
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
                        <Shield className="text-text-primary" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2">Admin Portal</h1>
                    <p className="text-slate-400 text-lg">Bloody Roar Platform</p>
                    <div className="mt-4 inline-block px-4 py-1.5 bg-indigo-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20">
                        <p className="text-sm text-indigo-400">🔒 Server-side Secure Auth</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-[#1e293b] backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#334155]">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
                        <p className="text-slate-400 text-sm">Sign in to access the admin dashboard</p>
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
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-slate-500" size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="admin@yourdomain.com"
                                    required
                                    autoComplete="email"
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
                                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-text-primary font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                Protected area — Authorized personnel only
                            </p>
                            <p className="text-xs text-slate-500 text-center mt-2">
                                Need help? Contact system administrator
                            </p>
                        </div>
                    </div>
                </div>

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
