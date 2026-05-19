import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, Calendar, Github, Send, DollarSign, User, Star, Clock,
    ExternalLink, FileText, Loader2, Shield, CheckCircle, Globe,
    Cpu, Sparkles, Smartphone, Gamepad2, Code, Users, Zap, FolderOpen,
    MessageCircle, XCircle, Wallet, Lock
} from "lucide-react";
import { useAuth } from "@app/context/AuthContext";
import { useChat } from "@app/context/ChatContext";
import { Link } from "react-router-dom";
import CommentSection from "@features/comments/ui/CommentSection";
import EscrowPanel from "@entities/workspace/ui/EscrowPanel";
import { depositFunds } from "@shared/web3/escrowService";

const IssueDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { openChat } = useChat();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");

    // Applicants state (Client view)
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null); // appId being accepted
    const [acceptError, setAcceptError] = useState("");

    const isClient = user && issue && (
        (user._id || user.id) === (issue.clientId?._id || issue.clientId)
    );

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

    useEffect(() => {
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
            fetchIssue();
            if (isClient) fetchApplications();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    // Fetch applicants (Client only)
    const fetchApplications = async () => {
        setLoadingApps(true);
        try {
            const res = await axios.get(`/api/issues/${id}/applications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoadingApps(false);
        }
    };

    useEffect(() => {
        if (isClient && issue?.status === 'OPEN') fetchApplications();
    }, [isClient, issue?.status]);

    // Accept application + Escrow deposit
    const handleAccept = async (application) => {
        const dev = application.developer;
        if (!dev?.walletAddress) {
            setAcceptError(`Developer "${dev?.name}" has no wallet connected. Ask them to connect MetaMask on their profile first.`);
            return;
        }

        if (!window.confirm(`Accept ${dev.name} and deposit ${issue.bounty.amount} ${issue.bounty.currency} into escrow?`)) return;

        setAcceptingId(application._id);
        setAcceptError("");

        try {
            // Step 1: On-chain deposit via MetaMask
            const txHash = await depositFunds(
                issue._id.toString(),
                dev.walletAddress,
                issue.bounty.amount
            );

            // Step 2: Notify backend — approve + create workspace
            await axios.post(`/api/issues/${id}/approve/${application._id}`, {
                txHash
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Step 3: Refresh data
            await fetchIssue();

            // Step 4: Open chat with accepted dev
            openChat({
                issueId: id,
                devId: dev._id,
                name: dev.name,
                issueTitle: issue.title
            });

        } catch (err) {
            console.error("Accept Error Details:", err);
            const msg = err?.reason || err?.response?.data?.message || err?.message || 'Accept failed';
            setAcceptError(msg);
        } finally {
            setAcceptingId(null);
        }
    };

    // Open chat with a specific developer
    const handleOpenChat = (devId, devName) => {
        openChat({
            issueId: id,
            devId,
            name: devName,
            issueTitle: issue?.title
        });
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
        return classes[category] || 'bg-[#262626] text-text-secondary border-border-light';
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
                <Loader2 className="animate-spin text-text-primary mb-4" size={32} />
                <p className="text-text-secondary text-sm">Loading bounty details...</p>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-14 h-14 bg-bg-elevated rounded-full flex items-center justify-center mb-4 border border-border">
                    <FileText className="text-text-muted" size={24} />
                </div>
                <p className="text-text-secondary text-lg font-medium mb-1">Bounty not found</p>
                <p className="text-text-muted text-sm mb-4">This bounty may have been removed or doesn't exist.</p>
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
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-[13px] group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Marketplace
            </button>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
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
                                <span className="text-[12px] text-text-muted">
                                    Posted {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-text-primary mb-4">{issue?.title || "Untitled"}</h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} className="text-text-muted" />
                                    {issue?.applicationCount || 0} applications
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-text-muted" />
                                    {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-bg-secondary rounded-xl border border-border p-6">
                        <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wider mb-4">Description</h3>
                        <div className="text-text-primary leading-relaxed whitespace-pre-wrap text-[14px]">
                            {issue?.description || "No description provided"}
                        </div>

                        {/* Attachments */}
                        {issue?.attachments && issue.attachments.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <h4 className="text-[13px] font-medium text-text-muted uppercase tracking-wider mb-4">Attachments</h4>
                                <div className="grid gap-3">
                                    {issue.attachments.map((attachment, index) => (
                                        <div key={index} className="rounded-lg overflow-hidden border border-border">
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

                    {/* Application Form (OPEN status) */}
                    {user && user.role !== 'ADMIN' && !isClient && issue.status === 'OPEN' && (
                        <div className="bg-bg-secondary rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0070f3]/10 rounded-lg flex items-center justify-center">
                                        <Send size={18} className="text-[#0070f3]" />
                                    </div>
                                    <div>
                                        <h3 className="text-text-primary font-semibold">Apply for this Bounty</h3>
                                        <p className="text-[12px] text-text-muted">Submit your application to work on this task</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-text-muted uppercase tracking-wider">Reward</p>
                                    <p className="text-xl font-bold bounty-text">
                                        {issue.bounty?.amount} {issue.bounty?.currency}
                                    </p>
                                </div>
                            </div>

                            <textarea
                                className="w-full p-4 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-[#71717a] focus:outline-none focus:border-border-hover resize-none transition-all text-[14px] leading-relaxed"
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
                                    <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                                ) : (
                                    <><Send size={16} /> Submit Application</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Applicants Section (CLIENT only, OPEN status) */}
                    {isClient && issue.status === 'OPEN' && (
                        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                            <Users size={18} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-text-primary font-semibold">Applications</h3>
                                            <p className="text-[12px] text-text-muted">
                                                {applications.length} developer{applications.length !== 1 ? 's' : ''} applied
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={fetchApplications} disabled={loadingApps}
                                        className="text-[12px] text-text-muted hover:text-text-primary transition">
                                        {loadingApps ? <Loader2 size={14} className="animate-spin" /> : 'Refresh'}
                                    </button>
                                </div>
                            </div>

                            {acceptError && (
                                <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-400">{acceptError}</p>
                                </div>
                            )}

                            {loadingApps ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="animate-spin text-text-muted" size={24} />
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Users size={28} className="text-text-muted mx-auto mb-2" />
                                    <p className="text-text-muted text-sm">No applications yet</p>
                                    <p className="text-[#525252] text-xs mt-1">Developers will appear here when they apply</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#262626]">
                                    {applications.map((app) => (
                                        <div key={app._id} className="p-5 hover:bg-bg-tertiary transition-colors">
                                            {/* Developer Info */}
                                            <div className="flex items-start gap-4">
                                                <Link to={`/profile/${app.developer?._id}`}>
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                                                        {app.developer?.avatar ? (
                                                            <img src={app.developer.avatar} alt={app.developer.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-text-primary font-bold text-lg">
                                                                {app.developer?.name?.[0]?.toUpperCase() || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <Link to={`/profile/${app.developer?._id}`}
                                                            className="text-text-primary font-semibold text-sm hover:underline">
                                                            {app.developer?.name || 'Developer'}
                                                        </Link>
                                                        <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                                                            <Star size={10} className="text-[#f5a623]" fill="#f5a623" />
                                                            {app.developer?.reputation || 0}
                                                        </span>
                                                        {app.developer?.walletAddress && (
                                                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                                                <Wallet size={9} /> Wallet connected
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-amber-500/20 text-amber-400'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </div>

                                                    {/* Skills */}
                                                    {app.developer?.skills?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {app.developer.skills.slice(0, 6).map((skill, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 bg-bg-elevated text-text-secondary rounded text-[10px] border border-border">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {app.developer.skills.length > 6 && (
                                                                <span className="text-[10px] text-text-muted">+{app.developer.skills.length - 6}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Cover Letter */}
                                                    <div className="bg-bg-elevated rounded-lg p-3 border border-border mb-3">
                                                        <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1 font-medium">Cover Letter</p>
                                                        <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                                                            {app.coverLetter}
                                                        </p>
                                                    </div>

                                                    {/* Bid + Date */}
                                                    <div className="flex items-center gap-4 text-[12px] text-text-muted mb-3">
                                                        {app.bidAmount && (
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign size={12} />
                                                                Bid: <strong className="text-text-primary">{app.bidAmount} {issue.bounty?.currency}</strong>
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    {app.status === 'PENDING' && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleAccept(app)}
                                                                disabled={acceptingId === app._id}
                                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs transition-all disabled:opacity-50"
                                                            >
                                                                {acceptingId === app._id ? (
                                                                    <><Loader2 size={12} className="animate-spin" /> Processing...</>
                                                                ) : (
                                                                    <><Lock size={12} /> Accept & Fund {issue.bounty?.amount} {issue.bounty?.currency}</>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenChat(app.developer?._id, app.developer?.name)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-elevated text-text-primary border border-border-light rounded-lg text-xs transition-all"
                                                            >
                                                                <MessageCircle size={12} /> Chat
                                                            </button>
                                                        </div>
                                                    )}

                                                    {app.status === 'ACCEPTED' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                                <CheckCircle size={12} /> Accepted — Workspace created
                                                            </span>
                                                            <button
                                                                onClick={() => handleOpenChat(app.developer?._id, app.developer?.name)}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs transition-all ml-auto"
                                                            >
                                                                <MessageCircle size={12} /> Open Chat
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assigned Developer Card (ONGOING status) */}
                    {issue.assignedDeveloper && ['ONGOING', 'WAITING_REVIEW', 'COMPLETED'].includes(issue.status) && (
                        <div className="bg-bg-secondary rounded-xl border border-emerald-500/30 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span className="text-[12px] font-medium text-emerald-400 uppercase tracking-wider">Assigned Developer</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/profile/${issue.assignedDeveloper._id}`}>
                                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-text-primary font-medium overflow-hidden">
                                        {issue.assignedDeveloper.avatar ? (
                                            <img src={issue.assignedDeveloper.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            issue.assignedDeveloper.name?.[0]?.toUpperCase() || 'D'
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1">
                                    <Link to={`/profile/${issue.assignedDeveloper._id}`}
                                        className="font-medium text-text-primary hover:underline">{issue.assignedDeveloper.name}</Link>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Star size={12} className="text-[#f5a623]" fill="#f5a623" />
                                        <span className="text-[12px] text-text-secondary">{issue.assignedDeveloper.reputation || 0} reputation</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenChat(issue.assignedDeveloper._id, issue.assignedDeveloper.name)}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs transition-all"
                                >
                                    <MessageCircle size={14} /> Chat
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <CommentSection issueId={id} />
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-4">
                    {/* Bounty Card */}
                    <div className="bg-gradient-to-br from-[#171717] to-[#0a0a0a] rounded-xl border border-border p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-[#f5a623]" />
                            <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Bounty Reward</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-4xl font-bold bounty-text">{issue?.bounty?.amount || 0}</span>
                            <span className="text-lg text-text-muted font-medium">{issue?.bounty?.currency || "ETH"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-text-muted">
                            <Shield size={12} />
                            <span>Secured via Smart Contract</span>
                        </div>
                    </div>

                    {/* Escrow Actions — visible for ONGOING/WAITING_REVIEW/COMPLETED issues */}
                    {['ONGOING', 'WAITING_REVIEW', 'COMPLETED'].includes(issue?.status) && (
                        <EscrowPanel issue={issue} user={user} onUpdate={fetchIssue} />
                    )}

                    {/* Client Info */}
                    <div className="bg-bg-secondary rounded-xl border border-border p-5">
                        <h4 className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-4">Posted by</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center text-text-primary font-medium">
                                {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">{issue.clientId?.name || "Client"}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star size={12} className="text-[#f5a623]" fill="#f5a623" />
                                    <span className="text-[12px] text-text-secondary">{issue.clientId?.reputation || 0} reputation</span>
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
                            className="flex items-center justify-between w-full p-4 bg-bg-secondary border border-border rounded-xl hover:border-border-hover transition-all font-medium text-text-primary text-[13px] group"
                        >
                            <div className="flex items-center gap-3">
                                <Github size={18} />
                                <span>View Repository</span>
                            </div>
                            <ExternalLink size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
                        </a>
                    )}

                    {/* Workspace Link — shows when issue has an active workspace */}
                    {issue.workspace?.workspaceId && ['ONGOING', 'WAITING_REVIEW'].includes(issue.status) && (
                        <Link
                            to={`/workspace/${issue.workspace.workspaceId}`}
                            className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-indigo-500/10 to-[#0a0a0a] border border-indigo-500/20 rounded-xl hover:border-indigo-500/40 transition-all font-medium text-text-primary text-[13px] group"
                        >
                            <div className="flex items-center gap-3">
                                <FolderOpen size={18} className="text-indigo-400" />
                                <span>Open Workspace</span>
                            </div>
                            <ExternalLink size={14} className="text-indigo-400 group-hover:text-text-primary transition-colors" />
                        </Link>
                    )}

                    {/* Tags */}
                    {issue.tags && issue.tags.length > 0 && (
                        <div className="bg-bg-secondary rounded-xl border border-border p-5">
                            <h4 className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-3">Skills Required</h4>
                            <div className="flex flex-wrap gap-2">
                                {issue.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 bg-bg-elevated text-text-secondary rounded-md text-[12px] border border-border"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-bg-secondary rounded-xl border border-border p-5">
                        <h4 className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-4">Quick Stats</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-[13px]">Category</span>
                                <span className="text-text-primary text-[13px] font-medium">{issue.category || 'General'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-[13px]">Status</span>
                                <span className={`badge ${getStatusBadge(issue.status)}`}>{issue.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-[13px]">Applications</span>
                                <span className="text-text-primary text-[13px] font-medium">{issue.applicationCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
