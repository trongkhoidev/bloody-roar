import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Github, Send, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ChatRoom from "../Chat/ChatRoom";
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

    if (loading) return <div className="p-10 text-center">Loading details...</div>;
    if (!issue) return <div className="p-10 text-center text-red-500">Issue not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} /> Back to Marketplace
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm mb-2 inline-block">
                                {issue?.category || "General"}
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{issue?.title || "Untitled"}</h1>
                            <div className="flex gap-4 text-sm text-gray-300">
                                <span className="flex items-center gap-1"><Calendar size={14} /> Posted: {new Date(issue?.createdAt || Date.now()).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1">Status: {issue?.status || "UNKNOWN"}</span>
                            </div>
                        </div>
                        {/* Redesigned Bounty Badge - Compact & Professional */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-2 rounded-xl shadow-lg">
                            <p className="text-white/80 text-xs font-medium mb-0.5">Bounty</p>
                            <div className="flex items-baseline gap-1">
                                <DollarSign size={18} className="text-white" />
                                <span className="text-2xl font-bold text-white">{issue?.bounty?.amount || 0}</span>
                                <span className="text-sm text-white/80 font-medium">{issue?.bounty?.currency || "ETH"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h3 className="text-lg font-bold mb-2">Description</h3>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {issue?.description || "No description provided"}
                            </div>

                            {/* Display attached images */}
                            {issue?.attachments && issue.attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {issue.attachments.map((attachment, index) => (
                                        <div key={index} className="border rounded-lg overflow-hidden">
                                            <img
                                                src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${attachment}`}
                                                alt={`Attachment ${index + 1}`}
                                                className="w-full h-auto"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    console.error('Failed to load image:', attachment);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {user?.role === 'DEVELOPER' && issue.status === 'OPEN' && (
                            <section className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Send size={20} className="text-red-600" />
                                        Apply for this Bounty
                                    </h3>
                                    <div className="bg-white px-4 py-2 rounded-lg border border-red-200">
                                        <p className="text-xs text-gray-500">Bounty</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {issue.bounty?.amount} <span className="text-sm text-gray-600">{issue.bounty?.currency}</span>
                                        </p>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none resize-none"
                                    rows="5"
                                    placeholder="✍️ Explain why you're the perfect fit for this task. Highlight your relevant experience and approach..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                />
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {applying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

                        {/* Comment Section */}
                        <CommentSection issueId={id} />
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 border rounded-xl bg-gray-50">
                            <h4 className="font-bold mb-2 text-sm text-gray-500 uppercase">Client Info</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                                    {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold">{issue.clientId?.name || "Client"}</p>
                                    <p className="text-xs text-gray-500">Reputation: {issue.clientId?.reputation || 0}</p>
                                </div>
                            </div>
                        </div>

                        {issue.githubRepoUrl && (
                            <a
                                href={issue.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                <Github size={18} />
                                View Repository
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
