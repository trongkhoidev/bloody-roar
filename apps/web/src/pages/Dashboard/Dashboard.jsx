import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Briefcase,
    Users,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    GitPullRequest,
    ExternalLink,
    DollarSign,
    Clock,
    TrendingUp,
    Plus,
    MessageSquare,
    Loader2,
    Trash2,
    Search,
    FolderOpen,
    History,
    Activity,
    Award
} from "lucide-react";
import { depositFunds, releaseFunds } from "@shared/web3/escrowService";
import { useChat } from "@app/context/ChatContext";
import { useWallet } from "@app/context/WalletContext";
import { useAuth } from "@app/context/AuthContext";
import Loader from "@shared/ui/Loader";

const Dashboard = () => {
    const { user } = useAuth();
    const { openChat } = useChat();
    const { connectWallet, isConnected } = useWallet();

    // State lists
    const [clientIssues, setClientIssues] = useState([]);
    const [devApplications, setDevApplications] = useState([]);
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingDev, setLoadingDev] = useState(true);

    // Accordion for applications on posted bounties
    const [expandedIssue, setExpandedIssue] = useState(null);
    const [issueApplications, setIssueApplications] = useState({});

    // Active Dashboard Tab: 'bounties' (Orange 🟠), 'applications' (Blue 🔵), 'history' (Green/Slate 📜)
    const [activeTab, setActiveTab] = useState("bounties");

    // Filter sub-states
    const [bountyFilter, setBountyFilter] = useState("ALL"); // ALL, OPEN, ONGOING, COMPLETED

    useEffect(() => {
        if (user) {
            fetchClientIssues();
            fetchDevApplications();
        }
    }, [user]);

    const fetchClientIssues = async () => {
        try {
            const res = await axios.get("/api/issues/client/my-issues", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setClientIssues(res.data.data || []);
        } catch (error) {
            console.error("Error fetching client issues:", error);
        } finally {
            setLoadingClient(false);
        }
    };

    const fetchDevApplications = async () => {
        try {
            const res = await axios.get("/api/issues/my/applications", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDevApplications(res.data.data || []);
        } catch (error) {
            console.error("Error fetching developer applications:", error);
        } finally {
            setLoadingDev(false);
        }
    };

    const toggleExpandIssue = async (issueId) => {
        if (expandedIssue === issueId) {
            setExpandedIssue(null);
            return;
        }
        setExpandedIssue(issueId);

        if (!issueApplications[issueId]) {
            try {
                const res = await axios.get(`/api/issues/${issueId}/applications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setIssueApplications(prev => ({ ...prev, [issueId]: res.data.data }));
            } catch (error) {
                console.error("Error fetching applications for issue:", error);
            }
        }
    };

    const handleChatClick = (issueId, peerId, peerName, issueTitle) => {
        openChat({ issueId, devId: peerId, name: peerName, issueTitle });
    };

    const handleApproveDeveloper = async (issueId, appId, developerAddress, budgetAmount) => {
        if (!isConnected) {
            alert("Please connect your wallet to approve and lock deposit.");
            await connectWallet();
            return;
        }

        if (!confirm("Are you sure you want to hire this developer? You will be asked to DEPOSIT funds (ETH) into the Escrow Contract.")) return;

        try {
            const workerAddress = developerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            const txHash = await depositFunds(issueId, workerAddress, budgetAmount);
            alert("Deposit Successful! Synchronizing workspace...");

            await axios.post(`/api/issues/${issueId}/approve/${appId}`, { txHash }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Application Approved & Funds Locked in Escrow!");

            fetchClientIssues();
            setExpandedIssue(null);
        } catch (error) {
            console.error(error);
            alert(error.message || "Approval & escrow lock failed");
        }
    };

    const handleReleaseEscrow = async (issueId) => {
        if (!isConnected) {
            alert("Please connect your wallet to release payment.");
            await connectWallet();
            return;
        }

        if (!confirm("Confirm solution is correct and release funds to the Developer's wallet?")) return;

        try {
            await releaseFunds(issueId);
            alert("Escrow Released! Developer paid successfully.");
            fetchClientIssues();
        } catch (error) {
            console.error(error);
            alert(error.message || "Release payment failed");
        }
    };

    const handleDeleteBounty = async (issueId) => {
        if (!confirm("Are you sure you want to delete this bounty post?")) return;
        try {
            await axios.delete(`/api/issues/${issueId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setClientIssues(prev => prev.filter(i => i._id !== issueId));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete post");
        }
    };

    // Calculate Client stats
    const clientStats = {
        total: clientIssues.length,
        open: clientIssues.filter(i => i.status === 'OPEN').length,
        ongoing: clientIssues.filter(i => i.status === 'ONGOING').length,
        completed: clientIssues.filter(i => i.status === 'COMPLETED').length,
        totalValue: clientIssues.reduce((acc, i) => acc + (i.bounty?.amount || 0), 0)
    };

    // Calculate Developer stats
    const devStats = {
        total: devApplications.length,
        pending: devApplications.filter(a => a.status === 'PENDING').length,
        accepted: devApplications.filter(a => a.status === 'ACCEPTED').length,
        potentialEarnings: devApplications.filter(a => a.status === 'ACCEPTED').reduce((acc, a) => acc + (a.issue?.bounty?.amount || 0), 0)
    };

    const filteredClientIssues = bountyFilter === "ALL"
        ? clientIssues.filter(i => i.status !== "COMPLETED")
        : clientIssues.filter(i => i.status === bountyFilter);

    // History data: Completed items or resolved status from both sides
    const clientHistory = clientIssues.filter(i => i.status === "COMPLETED");
    const devHistory = devApplications.filter(a => a.status === "ACCEPTED" && a.issue?.status === "COMPLETED");

    if (loadingClient || loadingDev) return <Loader text="Synchronizing your unified dashboard..." />;

    return (
        <div className="space-y-8 animate-fade-in w-full">
            {/* Header Title Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Unified Dashboard</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Review your postings as a Client, monitor applications as a Developer, and check payment history.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/post-job"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#f5a623] to-[#fb923c] text-bg-primary font-bold text-[13px] rounded-lg shadow-md transition-all hover:scale-[1.01]"
                    >
                        <Plus size={16} />
                        Post Bounty
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-text-primary font-bold text-[13px] rounded-lg transition-all"
                    >
                        <Search size={16} />
                        Browse Issues
                    </Link>
                </div>
            </div>

            {/* eKYC Trust Banner */}
            {user?.kycStatus !== "APPROVED" && (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-400">
                            <span className="text-[14px]">🛡️</span>
                            <span className="text-[12px] font-bold uppercase tracking-wider">High-Reputation Identity Verification</span>
                        </div>
                        <h3 className="font-bold text-text-primary text-[15px]">Verify your profile with secure cross-device eKYC</h3>
                        <p className="text-text-secondary text-[12px] max-w-xl">
                            Unlock maximum escrow trust, receive gasless Soulbound SBT credentials on-chain, and raise your deposit limits to protect against disputes.
                        </p>
                    </div>
                    <Link
                        to="/kyc"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] rounded-lg shadow-sm transition-all text-center self-start sm:self-center shrink-0 cursor-pointer"
                    >
                        Verify Identity
                    </Link>
                </div>
            )}

            {/* Premium Role Tabs Selector */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <button
                    onClick={() => setActiveTab("bounties")}
                    className={`flex items-center gap-2 px-5 py-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "bounties"
                        ? "border-[#f5a623] text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    <span className="text-[12px] opacity-75">🟠</span>
                    <span>My Bounties (Client)</span>
                    <span className="bg-bg-elevated px-2 py-0.5 rounded text-[10px] text-text-secondary">
                        {clientStats.total - clientStats.completed}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("applications")}
                    className={`flex items-center gap-2 px-5 py-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "applications"
                        ? "border-[#0070f3] text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    <span className="text-[12px] opacity-75">🔵</span>
                    <span>My Applications (Developer)</span>
                    <span className="bg-bg-elevated px-2 py-0.5 rounded text-[10px] text-text-secondary">
                        {devStats.total}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 px-5 py-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "history"
                        ? "border-[#00d68f] text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    <span className="text-[12px] opacity-75">📜</span>
                    <span>Activity History</span>
                    <span className="bg-bg-elevated px-2 py-0.5 rounded text-[10px] text-text-secondary">
                        {clientHistory.length + devHistory.length}
                    </span>
                </button>
            </div>

            {/* TAB CONTENT: MY BOUNTIES (CLIENT) */}
            {activeTab === "bounties" && (
                <div className="space-y-6 animate-fade-in">
                    {/* Poster Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Posted</p>
                            <p className="text-xl font-bold text-text-primary">{clientStats.total}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Open Bounties</p>
                            <p className="text-xl font-bold text-[#00d68f]">{clientStats.open}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Fixes in Progress</p>
                            <p className="text-xl font-bold text-[#0070f3]">{clientStats.ongoing}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Budget Committed</p>
                            <p className="text-xl font-bold text-[#f5a623]">{clientStats.totalValue.toFixed(4)} ETH</p>
                        </div>
                    </div>

                    {/* Bounty Sub-filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {["ALL", "OPEN", "ONGOING"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setBountyFilter(status)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer border ${bountyFilter === status
                                    ? "bg-bg-elevated border-[#f5a623] text-text-primary"
                                    : "bg-bg-secondary/40 border-border text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                {status === "ALL" ? "All Active Bounties" : status}
                            </button>
                        ))}
                    </div>

                    {/* Client Issue List */}
                    {clientIssues.length === 0 ? (
                        <div className="py-16 text-center bg-bg-secondary/30 border border-dashed border-border rounded-xl">
                            <Briefcase size={32} className="mx-auto text-text-muted mb-3" />
                            <p className="text-text-secondary font-semibold text-base mb-4">No active bounties posted</p>
                            <Link
                                to="/post-job"
                                className="px-5 py-2.5 bg-gradient-to-r from-[#f5a623] to-[#fb923c] text-bg-primary font-bold text-[13px] rounded-lg shadow-md transition-all inline-block"
                            >
                                Create Your First Bounty Post
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredClientIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="bg-bg-secondary border border-border rounded-xl overflow-hidden hover:border-border-hover transition-colors"
                                >
                                    {/* Bounty Header Summary */}
                                    <div
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-bg-elevated/20 transition-colors"
                                        onClick={() => toggleExpandIssue(issue._id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                <h3 className="font-bold text-[16px] text-text-primary truncate">{issue.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${issue.status === 'OPEN' ? 'bg-[#00d68f]/10 text-[#00d68f]' : 'bg-[#0070f3]/10 text-[#0070f3]'}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] text-text-secondary flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} />
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 font-semibold text-[#f5a623]">
                                                    <DollarSign size={13} />
                                                    {issue.bounty.amount} ETH
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-elevated border border-border rounded-lg text-[12px]">
                                                <Users size={13} className="text-text-secondary" />
                                                <span className="font-bold text-text-primary">{issue.applicationCount || 0}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBounty(issue._id);
                                                }}
                                                className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="p-1 bg-bg-elevated border border-border rounded">
                                                {expandedIssue === issue._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Application Review Portal */}
                                    {expandedIssue === issue._id && (
                                        <div className="border-t border-border bg-bg-elevated/10 p-5">
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Applicants & Management</p>

                                            {!issueApplications[issue._id] ? (
                                                <div className="flex items-center justify-center py-6 text-text-secondary text-[13px]">
                                                    <Loader2 className="animate-spin mr-2" size={16} />
                                                    Reviewing applications database...
                                                </div>
                                            ) : issueApplications[issue._id].length === 0 ? (
                                                <p className="text-center py-6 text-text-secondary text-[13px]">
                                                    No developer applications found yet. Share this bounty listing!
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {issueApplications[issue._id].map((app) => (
                                                        <div
                                                            key={app._id}
                                                            className="bg-bg-secondary p-4 border border-border rounded-xl flex flex-col md:flex-row justify-between gap-4"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#00d68f] rounded-lg flex items-center justify-center text-text-primary font-bold text-sm shrink-0">
                                                                    {app.developer?.name?.[0] || 'D'}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-bold text-[14px] text-text-primary">{app.developer?.name || "Developer"}</span>
                                                                        {app.developer?.githubUrl && (
                                                                            <a
                                                                                href={app.developer.githubUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                                                                            >
                                                                                GitHub <ExternalLink size={10} />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[13px] text-text-secondary mt-1 whitespace-pre-wrap line-clamp-2">
                                                                        {app.coverLetter}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {/* Open direct instant workspace chat */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleChatClick(issue._id, app.developer?._id, app.developer?.name, issue.title);
                                                                    }}
                                                                    className="p-2 bg-bg-elevated border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
                                                                    title="Open chat session"
                                                                >
                                                                    <MessageSquare size={16} />
                                                                </button>

                                                                {app.status === 'ACCEPTED' ? (
                                                                    <span className="flex items-center gap-1.5 text-[#00d68f] bg-[#00d68f]/10 px-3 py-1.5 rounded-lg border border-[#00d68f]/20 font-bold text-[12px]">
                                                                        <CheckCircle size={14} /> Approved
                                                                    </span>
                                                                ) : issue.status === 'OPEN' ? (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleApproveDeveloper(issue._id, app._id, app.developer?.walletAddress, issue.bounty.amount);
                                                                        }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-text-primary rounded-lg font-bold text-[12px] shadow-sm transition-all cursor-pointer"
                                                                    >
                                                                        Hire & Deposit
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex flex-col items-end gap-1.5">
                                                                        {issue.prLink && (
                                                                            <a
                                                                                href={issue.prLink}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-[11px] flex items-center gap-1 text-blue-400 hover:underline"
                                                                            >
                                                                                <GitPullRequest size={12} /> View PR
                                                                            </a>
                                                                        )}

                                                                        {issue.isPrMerged ? (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleReleaseEscrow(issue._id);
                                                                                }}
                                                                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-[#0070f3] text-text-primary rounded-lg font-bold text-[12px] shadow-md transition-all animate-pulse"
                                                                            >
                                                                                Release Funds
                                                                            </button>
                                                                        ) : (
                                                                            <span className="text-[11px] text-text-muted italic">Waiting for developer PR submission...</span>
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
            )}

            {/* TAB CONTENT: MY APPLICATIONS (DEVELOPER) */}
            {activeTab === "applications" && (
                <div className="space-y-6 animate-fade-in">
                    {/* Developer Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Applied</p>
                            <p className="text-xl font-bold text-text-primary">{devStats.total}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Pending Responses</p>
                            <p className="text-xl font-bold text-[#f5a623]">{devStats.pending}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Accepted Bounties</p>
                            <p className="text-xl font-bold text-[#00d68f]">{devStats.accepted}</p>
                        </div>
                        <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Locked Potential Earnings</p>
                            <p className="text-xl font-bold text-[#0070f3]">{devStats.potentialEarnings.toFixed(4)} ETH</p>
                        </div>
                    </div>

                    {/* Developer Application List */}
                    {devApplications.length === 0 ? (
                        <div className="py-16 text-center bg-bg-secondary/30 border border-dashed border-border rounded-xl">
                            <Award size={32} className="mx-auto text-text-muted mb-3" />
                            <p className="text-text-secondary font-semibold text-base mb-4">You have not applied to any bounties yet</p>
                            <Link
                                to="/"
                                className="px-5 py-2.5 bg-gradient-to-r from-[#0070f3] to-[#3291ff] text-white font-bold text-[13px] rounded-lg shadow-md transition-all inline-block"
                            >
                                Browse Open Fixes
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {devApplications.map((app) => (
                                <div
                                    key={app._id}
                                    className="bg-bg-secondary p-5 border border-border rounded-xl hover:border-border-hover transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                                <h3 className="font-bold text-[16px] text-text-primary hover:text-[#0070f3] transition-colors">
                                                    {app.issue?.title || "Unknown Bounty"}
                                                </h3>
                                                <span className={clsx(
                                                    "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                    app.status === 'ACCEPTED'
                                                        ? "bg-[#00d68f]/10 text-[#00d68f] border-[#00d68f]/20"
                                                        : app.status === 'REJECTED'
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                )}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] text-text-secondary flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} />
                                                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                </span>
                                                {app.issue?.bounty && (
                                                    <span className="flex items-center gap-1 text-[#f5a623] font-semibold">
                                                        <DollarSign size={13} />
                                                        {app.issue.bounty.amount} ETH
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Chat with Client */}
                                            <button
                                                onClick={() => openChat({
                                                    issueId: app.issue?._id,
                                                    devId: user._id,
                                                    name: app.issue?.clientId?.name || "Client",
                                                    issueTitle: app.issue?.title
                                                })}
                                                className="p-2 bg-bg-elevated border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
                                                title="Chat session with Poster"
                                            >
                                                <MessageSquare size={16} />
                                            </button>

                                            <Link
                                                to={`/issue/${app.issue?._id}`}
                                                className="p-2 bg-bg-elevated border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                                                title="View detailed listing"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>

                                            {app.status === 'ACCEPTED' && app.issue?.workspace?.workspaceId && (
                                                <Link
                                                    to={`/workspace/${app.issue.workspace.workspaceId}`}
                                                    className="flex items-center gap-1.5 text-blue-400 font-bold text-[12px] px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all shadow-sm"
                                                >
                                                    <FolderOpen size={14} />
                                                    <span>Open Workspace</span>
                                                </Link>
                                            )}

                                            {app.status === 'ACCEPTED' && (
                                                <span className="flex items-center gap-1.5 text-[#00d68f] bg-[#00d68f]/10 border border-[#00d68f]/20 px-3.5 py-2 rounded-lg font-bold text-[12px]">
                                                    <CheckCircle size={14} /> Hired
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: ACTIVITY HISTORY */}
            {activeTab === "history" && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-bg-secondary border border-border rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <History size={16} className="text-[#00d68f]" />
                            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Archived History Ledger</span>
                        </div>
                        <p className="text-[13px] text-text-secondary">
                            A immutable record of all completed, resolved smart contract releases and past activities.
                        </p>
                    </div>

                    {clientHistory.length === 0 && devHistory.length === 0 ? (
                        <div className="py-16 text-center bg-bg-secondary/30 border border-dashed border-border rounded-xl">
                            <Activity size={32} className="mx-auto text-text-muted mb-3" />
                            <p className="text-text-secondary font-semibold text-base">No historical records in archive</p>
                            <p className="text-text-muted text-sm mt-1">Once a bounty budget is released or completed, it appears here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Client Role History */}
                            {clientHistory.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-[#f5a623] uppercase tracking-wider">Payments Sent (Client)</p>
                                    {clientHistory.map((item) => (
                                        <div key={item._id} className="p-4 bg-bg-secondary/60 border border-border rounded-xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-[14px] text-text-primary">{item.title}</h4>
                                                <p className="text-[12px] text-text-muted">
                                                    Released to developer on {new Date(item.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-[#00d68f]/20 rounded-lg text-emerald-400 font-bold text-[13px]">
                                                <span>Sent {item.bounty.amount} ETH</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Developer Role History */}
                            {devHistory.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-[#0070f3] uppercase tracking-wider">Earnings Received (Developer)</p>
                                    {devHistory.map((app) => (
                                        <div key={app._id} className="p-4 bg-bg-secondary/60 border border-border rounded-xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-[14px] text-text-primary">{app.issue?.title || "Bounty Work"}</h4>
                                                <p className="text-[12px] text-text-muted">
                                                    Received on {new Date(app.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-[#00d68f]/20 rounded-lg text-emerald-400 font-bold text-[13px]">
                                                <span>Earned {app.issue?.bounty?.amount} ETH</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
