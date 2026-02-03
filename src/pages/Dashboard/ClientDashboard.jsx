import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Briefcase, Users, ChevronDown, ChevronUp, CheckCircle, GitPullRequest, ExternalLink, DollarSign, Clock, TrendingUp, Plus, MessageSquare, Loader2 } from "lucide-react";
import { depositFunds, releaseFunds } from "../../web3/escrowService";
import { useChat } from "../../context/ChatContext";
import Loader from "../../components/Loader";

const ClientDashboard = () => {
    const { openChat } = useChat();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIssue, setExpandedIssue] = useState(null);
    const [applications, setApplications] = useState({});

    useEffect(() => {
        fetchMyIssues();
    }, []);

    const fetchMyIssues = async () => {
        try {
            const res = await axios.get("/api/issues/client/my-issues", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setIssues(res.data.data);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (issueId) => {
        if (expandedIssue === issueId) {
            setExpandedIssue(null);
            return;
        }

        setExpandedIssue(issueId);
        if (!applications[issueId]) {
            try {
                const res = await axios.get(`/api/issues/${issueId}/applications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setApplications(prev => ({ ...prev, [issueId]: res.data.data }));
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        }
    };

    const handleChatClick = (issueId, devId, devName, issueTitle) => {
        openChat({ issueId, devId, name: devName, issueTitle });
    };

    const handleApprove = async (issueId, appId, developerAddress, budgetAmount) => {
        if (!confirm("Are you sure you want to approve this developer? You will be asked to DEPOSIT funds (ETH) into the Escrow Contract.")) return;

        try {
            const workerParams = developerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            alert(`Opening Metamask to Deposit ${budgetAmount} ETH for Worker: ${workerParams}...`);
            const txHash = await depositFunds(issueId, workerParams, budgetAmount);
            alert("Deposit Successful! Confirming in database...");

            await axios.post(`/api/issues/${issueId}/approve/${appId}`, { txHash }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Application Approved & Funds Locked!");

            fetchMyIssues();
            setExpandedIssue(null);
        } catch (error) {
            console.error(error);
            alert(error.message || "Approval failed");
        }
    };

    const handleRelease = async (issueId) => {
        if (!confirm("PR is Merged! Do you want to release the funds to the Developer?")) return;

        try {
            alert("Releasing funds via Smart Contract...");
            await releaseFunds(issueId);
            alert("Funds Released Successfully!");
            fetchMyIssues();
        } catch (error) {
            console.error(error);
            alert(error.message || "Release failed");
        }
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

    // Calculate stats
    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'OPEN').length,
        ongoing: issues.filter(i => i.status === 'ONGOING').length,
        completed: issues.filter(i => i.status === 'COMPLETED').length,
        totalBounty: issues.reduce((acc, i) => acc + (i.bounty?.amount || 0), 0)
    };

    if (loading) return <Loader text="Loading your dashboard..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Briefcase className="text-indigo-400" size={24} />
                        </div>
                        My Posted Bounties
                    </h2>
                    <p className="text-slate-400 mt-1">Manage your bounties and review applications</p>
                </div>
                <Link 
                    to="/post-job"
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                    <Plus size={18} />
                    Post New Bounty
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <Briefcase size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total</p>
                            <p className="text-xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Clock size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Open</p>
                            <p className="text-xl font-bold text-emerald-400">{stats.open}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <TrendingUp size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">In Progress</p>
                            <p className="text-xl font-bold text-indigo-400">{stats.ongoing}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-600/30 rounded-lg">
                            <CheckCircle size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Completed</p>
                            <p className="text-xl font-bold text-slate-300">{stats.completed}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <DollarSign size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Value</p>
                            <p className="text-xl font-bold text-amber-400">{stats.totalBounty.toFixed(2)} ETH</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            {issues.length === 0 ? (
                <div className="bg-[#1e293b] p-12 rounded-2xl text-center border border-dashed border-[#334155]">
                    <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 mb-4 text-lg">You haven't posted any bounties yet.</p>
                    <Link 
                        to="/post-job" 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                        <Plus size={18} />
                        Post Your First Bounty
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map(issue => (
                        <div key={issue._id} className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden hover:border-[#475569] transition-all">
                            {/* Issue Header */}
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-[#1e293b]/80 transition-colors"
                                onClick={() => toggleExpand(issue._id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-bold text-lg text-white">{issue.title}</h3>
                                        <span className={`badge ${getStatusBadge(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                                            <DollarSign size={14} />
                                            {issue.bounty.amount} {issue.bounty.currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-[#334155] rounded-xl">
                                        <Users size={16} className="text-slate-400" />
                                        <span className="font-bold text-white">{issue.applicationCount || 0}</span>
                                        <span className="text-slate-400 hidden md:inline">Applicants</span>
                                    </div>
                                    <div className="p-2 bg-[#334155] rounded-lg">
                                        {expandedIssue === issue._id ? 
                                            <ChevronUp size={20} className="text-slate-400" /> : 
                                            <ChevronDown size={20} className="text-slate-400" />
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedIssue === issue._id && (
                                <div className="border-t border-[#334155] bg-[#0f172a]/50 p-6">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Applications</h4>

                                    {!applications[issue._id] ? (
                                        <div className="flex items-center justify-center py-8 text-slate-400">
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                            Loading applications...
                                        </div>
                                    ) : applications[issue._id].length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            No applications yet. Share your bounty to attract developers.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {applications[issue._id].map(app => (
                                                <div key={app._id} className="bg-[#1e293b] p-5 rounded-xl border border-[#334155] flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                                            {app.developer?.name?.[0] || 'D'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <p className="font-bold text-white">{app.developer?.name || "Developer"}</p>
                                                                {app.developer?.githubUrl && (
                                                                    <a href={app.developer.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                                                        GitHub <ExternalLink size={10} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap line-clamp-3">{app.coverLetter}</p>
                                                            {app.bidAmount && (
                                                                <p className="text-sm text-amber-400 mt-2 font-medium flex items-center gap-1">
                                                                    <DollarSign size={14} />
                                                                    Proposed: {app.bidAmount} ETH
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatClick(issue._id, app.developer?._id, app.developer?.name, issue.title);
                                                            }}
                                                            className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-colors"
                                                            title="Chat with Developer"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>

                                                        {app.status === 'ACCEPTED' ? (
                                                            <span className="flex items-center gap-2 text-emerald-400 font-medium px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                                <CheckCircle size={16} /> Approved
                                                            </span>
                                                        ) : issue.status === 'OPEN' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(issue._id, app._id, app.developer?.walletAddress, issue.bounty.amount);
                                                                }}
                                                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                                                            >
                                                                Approve & Fund
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col items-end gap-2">
                                                                {issue.prLink && (
                                                                    <a href={issue.prLink} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-indigo-400 hover:underline">
                                                                        <GitPullRequest size={12} /> View PR
                                                                    </a>
                                                                )}

                                                                {issue.isPrMerged ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleRelease(issue._id); }}
                                                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all animate-pulse"
                                                                    >
                                                                        Release Funds
                                                                    </button>
                                                                ) : issue.status === 'ONGOING' ? (
                                                                    <span className="text-xs text-slate-500 italic">Waiting for PR...</span>
                                                                ) : (
                                                                    <span className="text-xs text-emerald-400 font-medium">Completed</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
