import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Github, Send, DollarSign, User, Star, Clock, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "../../components/Comments/CommentSection";

const IssueDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const res = await axios.get(`/api/issues/${id}`);
                setIssue(res.data.data);
            } catch (error) {
                console.error("Error fetching issue:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [id]);

    const handleApply = async () => {
        if (!coverLetter) return alert("Please write a cover letter");
        setApplying(true);
        try {
            await axios.post(`/api/issues/${id}/apply`, {
                coverLetter,
                bidAmount: issue?.bounty?.amount || 0
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Application submitted successfully!");
            navigate("/applications");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Web': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Blockchain': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'AI': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Mobile': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'Game': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        };
        return colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return 'badge-open';
            case 'ONGOING':
                return 'badge-ongoing';
            case 'COMPLETED':
                return 'badge-completed';
            default:
                return 'badge-completed';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500 mb-3" size={48} />
                <p className="text-slate-400 font-medium">Loading bounty details...</p>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-red-400" size={24} />
                </div>
                <p className="text-red-400 text-lg font-medium">Bounty not found</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    Return to marketplace
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Marketplace
            </button>

            {/* Main Card */}
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-[#1e293b] via-[#1e293b] to-indigo-900/20 p-8 border-b border-[#334155]">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-4">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getCategoryColor(issue?.category)}`}>
                                    {issue?.category || "General"}
                                </span>
                                <span className={`badge ${getStatusBadge(issue?.status)}`}>
                                    {issue?.status || "UNKNOWN"}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl font-bold text-white mb-4">{issue?.title || "Untitled"}</h1>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-500" /> 
                                    Posted {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={16} className="text-slate-500" />
                                    {issue?.applicationCount || 0} applications
                                </span>
                            </div>
                        </div>
                        
                        {/* Bounty Card */}
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 flex-shrink-0">
                            <p className="text-amber-400/80 text-sm font-medium mb-1">Bounty Reward</p>
                            <div className="flex items-baseline gap-2">
                                <DollarSign size={24} className="text-amber-400" />
                                <span className="text-4xl font-bold text-amber-400">{issue?.bounty?.amount || 0}</span>
                                <span className="text-lg text-amber-400/60 font-medium">{issue?.bounty?.currency || "ETH"}</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Secured via Smart Contract</p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-indigo-400" />
                                Description
                            </h3>
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap bg-[#0f172a]/50 p-5 rounded-xl border border-[#334155]">
                                {issue?.description || "No description provided"}
                            </div>

                            {/* Attachments */}
                            {issue?.attachments && issue.attachments.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Attachments</h4>
                                    <div className="grid gap-4">
                                        {issue.attachments.map((attachment, index) => (
                                            <div key={index} className="rounded-xl overflow-hidden border border-[#334155]">
                                                <img
                                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${attachment}`}
                                                    alt={`Attachment ${index + 1}`}
                                                    className="w-full h-auto"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Application Form */}
                        {user?.role === 'DEVELOPER' && issue.status === 'OPEN' && (
                            <section className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 rounded-2xl border border-indigo-500/20">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Send size={20} className="text-indigo-400" />
                                        Apply for this Bounty
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">You'll earn</p>
                                        <p className="text-xl font-bold text-amber-400">
                                            {issue.bounty?.amount} <span className="text-sm text-slate-400">{issue.bounty?.currency}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <textarea
                                    className="w-full p-4 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                                    rows="5"
                                    placeholder="Write your cover letter here. Explain why you're the perfect fit for this task, highlight your relevant experience and approach..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                />
                                
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {applying ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </section>
                        )}

                        {/* Comments */}
                        <CommentSection issueId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Client Info Card */}
                        <div className="bg-[#0f172a]/50 p-5 rounded-xl border border-[#334155]">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Posted by</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">{issue.clientId?.name || "Client"}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-sm font-medium">{issue.clientId?.reputation || 0}</span>
                                        </div>
                                        <span className="text-slate-500 text-sm">reputation</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GitHub Link */}
                        {issue.githubRepoUrl && (
                            <a
                                href={issue.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full p-4 bg-[#0f172a]/50 border border-[#334155] rounded-xl hover:border-[#475569] hover:bg-[#1e293b] transition-all font-medium text-white group"
                            >
                                <Github size={20} />
                                View Repository
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                            </a>
                        )}

                        {/* Tags */}
                        {issue.tags && issue.tags.length > 0 && (
                            <div className="bg-[#0f172a]/50 p-5 rounded-xl border border-[#334155]">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills Required</h4>
                                <div className="flex flex-wrap gap-2">
                                    {issue.tags.map((tag, i) => (
                                        <span 
                                            key={i} 
                                            className="px-3 py-1.5 bg-[#334155] text-slate-300 rounded-lg text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="bg-[#0f172a]/50 p-5 rounded-xl border border-[#334155]">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Category</span>
                                    <span className="text-white font-medium">{issue.category || 'General'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Status</span>
                                    <span className={`badge ${getStatusBadge(issue.status)}`}>{issue.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Applications</span>
                                    <span className="text-white font-medium">{issue.applicationCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
