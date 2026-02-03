import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { LayoutDashboard, ExternalLink, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, FileText, MessageSquare, Search, Loader2 } from "lucide-react";
import Loader from "../../components/Loader";

const DeveloperDashboard = () => {
    const { user } = useAuth();
    const { openChat } = useChat();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyApplications();
        }
    }, [user]);

    const fetchMyApplications = async () => {
        try {
            const res = await axios.get("/api/issues/my/applications", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 border border-red-500/20';
            default:
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        }
    };

    // Calculate stats
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'PENDING').length,
        accepted: applications.filter(a => a.status === 'ACCEPTED').length,
        totalEarnings: applications.filter(a => a.status === 'ACCEPTED').reduce((acc, a) => acc + (a.issue?.bounty?.amount || 0), 0)
    };

    if (loading) return <Loader text="Loading your applications..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <LayoutDashboard className="text-indigo-400" size={24} />
                        </div>
                        My Applications
                    </h2>
                    <p className="text-slate-400 mt-1">Track your job applications and earnings</p>
                </div>
                <Link 
                    to="/"
                    className="flex items-center gap-2 px-5 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl font-medium transition-colors"
                >
                    <Search size={18} />
                    Browse Bounties
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <FileText size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Applied</p>
                            <p className="text-xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Clock size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Pending</p>
                            <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Accepted</p>
                            <p className="text-xl font-bold text-emerald-400">{stats.accepted}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <DollarSign size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Potential Earnings</p>
                            <p className="text-xl font-bold text-indigo-400">{stats.totalEarnings.toFixed(2)} ETH</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="text-center py-16 bg-[#1e293b] rounded-2xl border border-dashed border-[#334155]">
                    <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 mb-4 text-lg">You haven't applied to any bounties yet.</p>
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                    >
                        <Search size={18} />
                        Browse the Marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div 
                            key={app._id} 
                            className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155] hover:border-[#475569] transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                                            {app.issue?.title || "Unknown Bounty"}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> 
                                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                                        </span>
                                        {app.issue?.bounty && (
                                            <span className="flex items-center gap-1 text-amber-400 font-medium">
                                                <DollarSign size={14} />
                                                {app.issue.bounty.amount} {app.issue.bounty.currency}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Chat with Client */}
                                    <button
                                        onClick={() => openChat({
                                            issueId: app.issue?._id,
                                            devId: user._id,
                                            name: app.issue?.clientId?.name || "Client",
                                            issueTitle: app.issue?.title
                                        })}
                                        className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-colors"
                                        title="Chat with Client"
                                    >
                                        <MessageSquare size={18} />
                                    </button>

                                    <Link 
                                        to={`/issue/${app.issue?._id}`} 
                                        className="p-2.5 bg-[#334155] text-slate-400 hover:text-white hover:bg-[#475569] rounded-xl transition-colors"
                                        title="View Bounty"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>

                                    {app.status === 'ACCEPTED' && (
                                        <span className="flex items-center gap-2 text-emerald-400 font-semibold text-sm px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <CheckCircle size={16} /> Hired
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;
