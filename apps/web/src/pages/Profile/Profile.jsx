import React, { useState, useEffect } from "react";
import { useAuth } from "@app/context/AuthContext";
import axios from "axios";
import { User, Camera, Save, Briefcase, Github, Linkedin, AlertTriangle, CheckCircle, Wallet, Globe, Award, Link2, Unlink } from "lucide-react";
import Loader from "@shared/ui/Loader";
import SkillSelector from "@entities/user/ui/SkillSelector";

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [walletLoading, setWalletLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [ghDisconnecting, setGhDisconnecting] = useState(false);

    const [formData, setFormData] = useState({
        name: "", email: "", githubUrl: "", linkedin: "",
        role: "", bio: "", location: "", portfolioUrl: "", skills: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "", email: user.email || "",
                githubUrl: user.githubUrl || "", linkedin: user.linkedin || "",
                role: user.role || "DEVELOPER", bio: user.bio || "",
                location: user.location || "", portfolioUrl: user.portfolioUrl || "",
                skills: user.skills || []
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSkillsChange = (newSkills) => setFormData({ ...formData, skills: newSkills });

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append("file", file);
        try {
            setLoading(true);
            const res = await axios.post(`/api/upload`, uploadData);
            const avatarUrl = res.data.data.url; // Use relative path or handle full URL if needed
            const updateRes = await axios.put(`/api/auth/profile`, { avatar: avatarUrl }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setUser({ ...user, ...updateRes.data.data });
            setMessage({ type: "success", text: "Avatar updated successfully!" });
        } catch {
            setMessage({ type: "error", text: "Failed to update avatar" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const res = await axios.put(`/api/auth/profile`, { ...formData }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setUser({ ...user, ...res.data.data });
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleGithubConnect = () => {
        const userId = user?._id || user?.id;
        window.location.href = `/api/github/auth?userId=${userId}`;
    };

    const handleGithubDisconnect = async () => {
        if (!window.confirm("Disconnect GitHub account?")) return;
        setGhDisconnecting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/github/disconnect`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setUser({ ...user, github: null });
            setMessage({ type: "success", text: "GitHub account disconnected." });
        } catch {
            setMessage({ type: "error", text: "Failed to disconnect GitHub." });
        } finally {
            setGhDisconnecting(false);
        }
    };

    const handleLinkWallet = async () => {
        if (!window.ethereum) {
            setMessage({ type: "error", text: "Please install MetaMask to link a wallet." });
            return;
        }
        setWalletLoading(true);
        setMessage(null);
        try {
            const { ethers } = await import("ethers");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();
            const message = `Link wallet to Bloody Roar: ${Date.now()}`;
            const signature = await signer.signMessage(message);

            const res = await axios.put(`/api/auth/link-wallet`, {
                walletAddress, signature, message
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setUser({ ...user, walletAddress: res.data.data.walletAddress });
            setMessage({ type: "success", text: `Wallet linked: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` });
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to link wallet" });
        } finally {
            setWalletLoading(false);
        }
    };

    const handleUnlinkWallet = async () => {
        if (!window.confirm("Unlink your wallet? You will need to re-link to receive escrow payments.")) return;
        try {
            await axios.put(`/api/auth/link-wallet`, {
                walletAddress: null, signature: "", message: ""
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setUser({ ...user, walletAddress: null });
            setMessage({ type: "success", text: "Wallet unlinked." });
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to unlink wallet" });
        }
    };

    if (!user) return <Loader />;
    const isGithubConnected = !!user.github?.username;

    return (
        <div className="max-w-[1400px] mx-auto py-8 px-6 animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
                    <p className="text-gray-400">Manage your account information and preferences</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-red-600 text-text-primary px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                    {loading ? <Loader size="small" /> : <><Save size={20} /> Save Changes</>}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border backdrop-blur-md
                    ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* ── Left Column ── */}
                <div className="space-y-6">
                    {/* Avatar Card */}
                    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 lg:p-8 flex items-start gap-6">
                        <div className="relative group flex-shrink-0">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-red-500 to-orange-500">
                                <div className="w-full h-full rounded-full border-4 border-[#1e293b] overflow-hidden bg-[#0f172a]">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                        alt="Avatar" className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 bg-red-600 rounded-full text-text-primary cursor-pointer hover:bg-red-700 transition shadow-lg">
                                <Camera size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-text-primary mb-1">{user.name}</h2>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${user.role === 'CLIENT' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {user.role}
                                </span>
                                {isGithubConnected && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                                        <Github size={10} /> @{user.github.username}
                                    </span>
                                )}
                            </div>
                            {user.walletAddress ? (
                                <div className="inline-flex items-center gap-2 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-emerald-500/30 group">
                                    <Wallet size={12} className="text-emerald-400" />
                                    <span className="font-mono text-xs text-emerald-300">
                                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleUnlinkWallet}
                                        title="Unlink wallet"
                                        className="ml-1 text-[#334155] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Unlink size={10} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleLinkWallet}
                                    disabled={walletLoading}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                                >
                                    <Wallet size={12} />
                                    {walletLoading ? "Connecting..." : "Link MetaMask Wallet"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* General Info */}
                    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 lg:p-8">
                        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <User size={20} className="text-red-500" /> General Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    className="w-full h-11 px-4 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary focus:border-red-500 outline-none transition-all"
                                    placeholder="Your full name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                <input type="email" name="email" value={formData.email} disabled
                                    className="w-full h-11 px-4 bg-[#0f172a]/50 border border-[#334155] rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Bio / About Me</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary focus:border-red-500 outline-none transition-all resize-none"
                                    placeholder="Tell us a bit about yourself..." />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 lg:p-8">
                        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <Globe size={20} className="text-emerald-500" /> Social Links
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary focus:border-red-500 outline-none transition-all"
                                    placeholder="GitHub Profile URL" />
                            </div>
                            <div className="relative">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary focus:border-red-500 outline-none transition-all"
                                    placeholder="LinkedIn Profile URL" />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#0f172a] border border-[#334155] rounded-xl text-text-primary focus:border-red-500 outline-none transition-all"
                                    placeholder="Portfolio / Personal Website" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="space-y-6">
                    {/* GitHub OAuth Connect Card */}
                    <div className={`bg-[#1e293b] rounded-2xl border p-6 lg:p-8 transition-colors
                        ${isGithubConnected ? 'border-emerald-500/30' : 'border-[#334155]'}`}>
                        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                            <Github size={20} className={isGithubConnected ? 'text-emerald-400' : 'text-gray-400'} />
                            GitHub Integration
                        </h3>
                        <p className="text-xs text-gray-500 mb-5">
                            Connect your GitHub account to enable Workspace, branch, and Pull Request features.
                        </p>

                        {isGithubConnected ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <img
                                        src={user.github.avatarUrl || `https://github.com/${user.github.username}.png`}
                                        alt={user.github.username}
                                        className="w-12 h-12 rounded-full border-2 border-emerald-500/30"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.github.username}`; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-text-primary">@{user.github.username}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Connected {user.github.connectedAt
                                                ? new Date(user.github.connectedAt).toLocaleDateString()
                                                : 'recently'}
                                        </p>
                                    </div>
                                    <a href={`https://github.com/${user.github.username}`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                        View →
                                    </a>
                                </div>
                                <button type="button" onClick={handleGithubDisconnect} disabled={ghDisconnecting}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50">
                                    <Unlink size={14} />
                                    {ghDisconnecting ? 'Disconnecting...' : 'Disconnect GitHub'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-5 bg-[#0f172a] border border-dashed border-[#334155] rounded-xl text-center">
                                    <Github size={28} className="text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No GitHub account connected</p>
                                    <p className="text-xs text-gray-600 mt-1">Required for Workspace &amp; Git features</p>
                                </div>
                                <button type="button" onClick={handleGithubConnect}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-text-primary font-semibold text-sm transition-all hover:border-slate-500 shadow-lg">
                                    <Github size={18} />
                                    Connect GitHub Account
                                    <Link2 size={14} className="text-slate-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Reputation */}
                        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 flex flex-col items-center justify-center text-center group hover:border-red-500/50 transition-colors col-span-2">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2 group-hover:scale-110 transition-transform">
                                <Award size={20} />
                            </div>
                            <div className="text-2xl font-bold text-text-primary mb-0.5">{user.reputation || 0}</div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Reputation Rating</div>
                        </div>

                        {/* Developer Stats Card */}
                        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5 group hover:border-blue-500/50 transition-colors flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Briefcase size={16} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Developer Stats</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Total Earnings</span>
                                    <span className="text-sm font-bold text-text-primary">{user.totalEarnings || 0} ETH</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Jobs Applied</span>
                                    <span className="text-sm font-bold text-text-primary">{user.jobsApplied || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Jobs Completed</span>
                                    <span className="text-xs text-green-400 font-bold">{user.jobsCompleted || 0} completed</span>
                                </div>
                            </div>
                        </div>

                        {/* Client Stats Card */}
                        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5 group hover:border-orange-500/50 transition-colors flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Wallet size={16} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Client Stats</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Total Spent</span>
                                    <span className="text-sm font-bold text-text-primary">{user.totalSpent || 0} ETH</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Bounties Posted</span>
                                    <span className="text-sm font-bold text-text-primary">{user.jobsPosted || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Completion Rate</span>
                                    <span className="text-xs text-orange-400 font-bold">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 lg:p-8">
                        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-500" />
                            Professional Skills &amp; Tech Stack
                        </h3>
                        <div className="p-1">
                            <p className="text-sm text-gray-400 mb-4">
                                Select the technologies you are proficient in. These will help us match you with relevant opportunities.
                            </p>
                            <SkillSelector selectedSkills={formData.skills} onChange={handleSkillsChange} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
