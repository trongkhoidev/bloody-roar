import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ArrowLeft, Calendar, Github, Send, DollarSign, User, Star, Clock, 
    ExternalLink, FileText, Loader2, Shield, CheckCircle, Globe, 
    Cpu, Sparkles, Smartphone, Gamepad2, Code, Users, Zap
} from "lucide-react";
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

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Web': return <Globe size={14} />;
            case 'Blockchain': return <Cpu size={14} />;
            case 'AI': return <Sparkles size={14} />;
            case 'Mobile': return <Smartphone size={14} />;
            case 'Game': return <Gamepad2 size={14} />;
            default: return <Code size={14} />;
        }
    };

    const getCategoryClass = (category) => {
        const classes = {
            'Web': 'category-web',
            'Blockchain': 'category-blockchain',
            'AI': 'category-ai',
            'Mobile': 'category-mobile',
            'Game': 'category-game',
        };
        return classes[category] || 'bg-[#262626] text-[#a1a1aa] border-[#333]';
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
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-white mb-4" size={32} />
                <p className="text-[#a1a1aa] text-sm">Loading bounty details...</p>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-14 h-14 bg-[#171717] rounded-full flex items-center justify-center mb-4 border border-[#262626]">
                    <FileText className="text-[#71717a]" size={24} />
                </div>
                <p className="text-[#a1a1aa] text-lg font-medium mb-1">Bounty not found</p>
                <p className="text-[#71717a] text-sm mb-4">This bounty may have been removed or doesn't exist.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="text-[13px] text-[#0070f3] hover:underline transition-colors"
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
                className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors text-[13px] group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Marketplace
            </button>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] overflow-hidden">
                        <div className="p-6">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                <span className={`badge ${getCategoryClass(issue?.category)} flex items-center gap-1.5`}>
                                    {getCategoryIcon(issue?.category)}
                                    {issue?.category || "General"}
                                </span>
                                <span className={`badge ${getStatusBadge(issue?.status)}`}>
                                    {issue?.status || "UNKNOWN"}
                                </span>
                                <span className="text-[12px] text-[#71717a]">
                                    Posted {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-white mb-4">{issue?.title || "Untitled"}</h1>
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#a1a1aa]">
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} className="text-[#71717a]" />
                                    {issue?.applicationCount || 0} applications
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-[#71717a]" />
                                    {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-6">
                        <h3 className="text-[13px] font-medium text-[#71717a] uppercase tracking-wider mb-4">Description</h3>
                        <div className="text-[#ededed] leading-relaxed whitespace-pre-wrap text-[14px]">
                            {issue?.description || "No description provided"}
                        </div>

                        {/* Attachments */}
                        {issue?.attachments && issue.attachments.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-[#262626]">
                                <h4 className="text-[13px] font-medium text-[#71717a] uppercase tracking-wider mb-4">Attachments</h4>
                                <div className="grid gap-3">
                                    {issue.attachments.map((attachment, index) => (
                                        <div key={index} className="rounded-lg overflow-hidden border border-[#262626]">
                                            <img
                                                src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${attachment}`}
                                                alt={`Attachment ${index + 1}`}
                                                className="w-full h-auto"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Application Form */}
                    {user?.role === 'DEVELOPER' && issue.status === 'OPEN' && (
                        <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0070f3]/10 rounded-lg flex items-center justify-center">
                                        <Send size={18} className="text-[#0070f3]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">Apply for this Bounty</h3>
                                        <p className="text-[12px] text-[#71717a]">Submit your application to work on this task</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-[#71717a] uppercase tracking-wider">Reward</p>
                                    <p className="text-xl font-bold bounty-text">
                                        {issue.bounty?.amount} {issue.bounty?.currency}
                                    </p>
                                </div>
                            </div>
                            
                            <textarea
                                className="w-full p-4 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] resize-none transition-all text-[14px] leading-relaxed"
                                rows="5"
                                placeholder="Write your cover letter here. Explain why you're the perfect fit for this task, highlight your relevant experience and approach..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                            
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="w-full mt-4 bg-white text-black px-6 py-3 rounded-lg font-medium text-[14px] hover:bg-[#e5e5e5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Comments */}
                    <CommentSection issueId={id} />
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-4">
                    {/* Bounty Card */}
                    <div className="bg-gradient-to-br from-[#171717] to-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-[#f5a623]" />
                            <span className="text-[12px] font-medium text-[#a1a1aa] uppercase tracking-wider">Bounty Reward</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl font-bold bounty-text">{issue?.bounty?.amount || 0}</span>
                            <span className="text-lg text-[#71717a] font-medium">{issue?.bounty?.currency || "ETH"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
                            <Shield size={12} />
                            <span>Secured via Smart Contract</span>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <h4 className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider mb-4">Posted by</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center text-white font-medium">
                                {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <p className="font-medium text-white">{issue.clientId?.name || "Client"}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star size={12} className="text-[#f5a623]" fill="#f5a623" />
                                    <span className="text-[12px] text-[#a1a1aa]">{issue.clientId?.reputation || 0} reputation</span>
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
                            className="flex items-center justify-between w-full p-4 bg-[#0a0a0a] border border-[#262626] rounded-xl hover:border-[#404040] transition-all font-medium text-white text-[13px] group"
                        >
                            <div className="flex items-center gap-3">
                                <Github size={18} />
                                <span>View Repository</span>
                            </div>
                            <ExternalLink size={14} className="text-[#71717a] group-hover:text-white transition-colors" />
                        </a>
                    )}

                    {/* Tags */}
                    {issue.tags && issue.tags.length > 0 && (
                        <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                            <h4 className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider mb-3">Skills Required</h4>
                            <div className="flex flex-wrap gap-2">
                                {issue.tags.map((tag, i) => (
                                    <span 
                                        key={i} 
                                        className="px-2.5 py-1 bg-[#171717] text-[#a1a1aa] rounded-md text-[12px] border border-[#262626]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <h4 className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider mb-4">Quick Stats</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[#a1a1aa] text-[13px]">Category</span>
                                <span className="text-white text-[13px] font-medium">{issue.category || 'General'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#a1a1aa] text-[13px]">Status</span>
                                <span className={`badge ${getStatusBadge(issue.status)}`}>{issue.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#a1a1aa] text-[13px]">Applications</span>
                                <span className="text-white text-[13px] font-medium">{issue.applicationCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
