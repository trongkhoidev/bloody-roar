import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Briefcase, Users, ChevronDown, ChevronUp, CheckCircle, GitPullRequest, ExternalLink } from "lucide-react";
import { depositFunds, releaseFunds } from "../../web3/escrowService";
import { useChat } from "../../context/ChatContext"; // Import ChatContext
import Loader from "../../components/Loader";

const ClientDashboard = () => {
    // const { user } = useAuth(); // User not explicitly needed
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
        // Fetch applications if not already fetched
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
            // 1. Web3 Deposit
            const workerParams = developerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat Account #1

            alert(`Opening Metamask to Deposit ${budgetAmount} ETH for Worker: ${workerParams}...`);
            const txHash = await depositFunds(issueId, workerParams, budgetAmount);

            alert("Deposit Successful! Confirming in database...");

            // 2. Backend Sync
            await axios.post(`/api/issues/${issueId}/approve/${appId}`, { txHash }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Application Approved & Funds Locked!");

            fetchMyIssues(); // Refresh status
            setExpandedIssue(null); // Close accordion
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

    if (loading) return <Loader text="Loading your dashboard..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="text-red-600" />
                My Posted Jobs
            </h2>

            {issues.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                    <Link to="/post-job" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700">
                        Post Your First Job
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map(issue => (
                        <div key={issue._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => toggleExpand(issue._id)}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg">{issue.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${issue.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                            issue.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                            }`}>{issue.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center gap-4">
                                        <span>Posted: {new Date(issue.createdAt).toLocaleDateString()}</span>
                                        <span>Budget: {issue.bounty.amount} {issue.bounty.currency}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Users size={18} />
                                        <span className="font-bold">{issue.applicationCount || 0}</span>
                                        <span className="hidden md:inline">Applicants</span>
                                    </div>
                                    {expandedIssue === issue._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Accordion Content (Applications) */}
                            {expandedIssue === issue._id && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6">
                                    <h4 className="font-bold text-sm text-gray-500 mb-4 uppercase">Applicants</h4>

                                    {!applications[issue._id] ? (
                                        <div className="text-center py-4">Loading apps...</div>
                                    ) : applications[issue._id].length === 0 ? (
                                        <div className="text-center py-4 text-gray-400 italic">No applications yet.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {applications[issue._id].map(app => (
                                                <div key={app._id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold">{app.developer?.name || "Developer"}</p>
                                                                {app.developer?.githubUrl && (
                                                                    <a href={app.developer.githubUrl} target="_blank" className="text-xs text-blue-500 hover:underline">GitHub</a>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{app.coverLetter}</p>
                                                            {app.bidAmount && (
                                                                <p className="text-xs text-green-600 mt-2 font-semibold">
                                                                    Proposed: {app.bidAmount} ETH
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end md:self-center">
                                                        {/* CHAT BUTTON - Using Global Context */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatClick(issue._id, app.developer?._id, app.developer?.name, issue.title);
                                                            }}
                                                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 shadow-sm transition"
                                                            title="Chat with Developer"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </button>

                                                        {app.status === 'ACCEPTED' ? (
                                                            <span className="flex items-center gap-1 text-green-600 font-bold px-3 py-1 bg-green-50 rounded-lg">
                                                                <CheckCircle size={16} /> Approved
                                                            </span>
                                                        ) : issue.status === 'OPEN' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(issue._id, app._id, app.developer?.walletAddress, issue.bounty.amount);
                                                                }}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm"
                                                            >
                                                                Approve & Fund
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col items-end gap-1">
                                                                {issue.prLink && (
                                                                    <a href={issue.prLink} target="_blank" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                                                        <GitPullRequest size={12} /> View PR
                                                                    </a>
                                                                )}

                                                                {issue.isPrMerged ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleRelease(issue._id); }}
                                                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm animate-pulse"
                                                                    >
                                                                        Release Funds
                                                                    </button>
                                                                ) : issue.status === 'ONGOING' ? (
                                                                    <span className="text-xs text-gray-500 italic">Waiting for PR...</span>
                                                                ) : (
                                                                    <span className="text-xs text-green-600 font-bold">Completed</span>
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
