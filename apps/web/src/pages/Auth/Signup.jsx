import React, { useState } from "react";
import { useAuth } from "@app/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Briefcase, Github, Linkedin, Code, UserPlus, Loader2 } from "lucide-react";
import SkillSelector from "@entities/user/ui/SkillSelector";
import { UserRole } from "@bloody-roar/shared-types";

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: UserRole.DEVELOPER,
        skills: [],
        githubUrl: "",
        linkedin: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError("");

        // Basic validation for Step 1
        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all required fields.");
            return;
        }

        setStep(2);
    };

    const handleBack = () => {
        setError("");
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const userData = {
            ...formData,
            skills: formData.skills
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
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 animate-fade-in">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <img src="/image/logo.png" alt="Bloody Roar" className="w-12 h-12 rounded-full object-cover shadow-lg shadow-blue-500/10" />
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Bloody Roar</h1>
                    <p className="text-xs text-text-muted">Web3 Bounty Platform</p>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Create your account</h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <span className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-border'} transition-colors`}></span>
                    <span className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-border'} transition-colors`}></span>
                </div>
                <p className="mt-2 text-text-secondary text-sm font-semibold">
                    Step {step} of 2: {step === 1 ? "Account Info" : "Profile Details"}
                </p>
            </div>

            {/* Form Card */}
            <div className="max-w-lg w-full mx-auto">
                <div className="bg-bg-secondary rounded-2xl border border-border p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm rounded-xl flex items-start gap-3">
                            <div className="flex-1">{error}</div>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Step 1: Account Information */}
                        {step === 1 && (
                            <div className="space-y-5 animate-slide-right">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-text-muted" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-text-muted" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-text-muted" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">I am a...</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-text-muted" />
                                        </div>
                                        <select
                                            name="role"
                                            className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none transition-all text-[14px]"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value={UserRole.DEVELOPER}>Developer (Looking for bounties)</option>
                                            <option value={UserRole.CLIENT}>Client (Posting bounties)</option>
                                            <option value={UserRole.BOTH}>Both (Posting & Working)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer text-[14px]"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Profile Details */}
                        {step === 2 && (
                            <div className="space-y-5 animate-slide-left">
                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">Skills</label>
                                    <SkillSelector
                                        selectedSkills={formData.skills}
                                        onChange={(newSkills) => setFormData({ ...formData, skills: newSkills })}
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2">GitHub URL</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Github className="h-5 w-5 text-text-muted" />
                                            </div>
                                            <input
                                                type="url"
                                                name="githubUrl"
                                                className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                                placeholder="https://github.com/..."
                                                value={formData.githubUrl}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2">LinkedIn URL</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Linkedin className="h-5 w-5 text-text-muted" />
                                            </div>
                                            <input
                                                type="url"
                                                name="linkedin"
                                                className="w-full pl-11 pr-4 py-3.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[14px]"
                                                placeholder="https://linkedin.com/..."
                                                value={formData.linkedin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 py-3.5 px-4 rounded-xl font-semibold border border-border text-text-secondary hover:bg-bg-elevated transition-all cursor-pointer text-[14px]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[14px]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Creating Account
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Create Account
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <p className="text-center text-xs text-text-muted mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
