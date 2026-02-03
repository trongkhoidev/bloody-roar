import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Briefcase, Github, Linkedin, Code, Zap, UserPlus, Loader2 } from "lucide-react";

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "DEVELOPER",
        skills: "",
        githubUrl: "",
        linkedin: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const userData = {
            ...formData,
            skills: formData.skills.split(",").map(skill => skill.trim()).filter(skill => skill)
        };

        const res = await register(userData);

        if (res.success) {
            navigate("/");
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center py-12 px-4 animate-fade-in">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Zap size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Bloody Roar</h1>
                    <p className="text-xs text-slate-400">Web3 Bounty Platform</p>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Create your account</h2>
                <p className="mt-2 text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            {/* Form Card */}
            <div className="max-w-lg w-full mx-auto">
                <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm rounded-xl flex items-start gap-3">
                            <div className="flex-1">{error}</div>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-500" />
                                </div>
                                <select
                                    name="role"
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none transition-all"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="DEVELOPER">Developer (Looking for bounties)</option>
                                    <option value="CLIENT">Client (Posting bounties)</option>
                                    <option value="TUTOR">Tutor (Teaching)</option>
                                </select>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma separated)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Code className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    name="skills"
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="React, Node.js, Solidity"
                                    value={formData.skills}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Github className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="url"
                                        name="githubUrl"
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="https://github.com/..."
                                        value={formData.githubUrl}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Linkedin className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="https://linkedin.com/..."
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Signup;
