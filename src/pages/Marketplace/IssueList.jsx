import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Code, Search, Filter, Briefcase, DollarSign, Clock, Calendar, MessageCircle, Eye, ChevronRight, Send } from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

const IssueList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: "", status: "", minBudget: "" });

    useEffect(() => {
        fetchIssues();
    }, [filter]);

    const fetchIssues = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.category) params.append("category", filter.category);
            if (filter.status) params.append("status", filter.status);
            if (filter.minBudget) params.append("minBudget", filter.minBudget);

            const res = await axios.get(`/api/issues?${params.toString()}`);
            setIssues(res.data.data);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const getRelativeTime = (date) => {
        if (!date) return "Không rõ thời gian";

        const d = new Date(date);
        if (isNaN(d.getTime())) return "Không rõ thời gian";

        const seconds = Math.floor((new Date() - d) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval > 1) return interval + " năm trước";
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + " tháng trước";
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + " ngày trước";
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + " giờ trước";
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + " phút trước";
        return "Vừa xong";
    };

    const formatDateTime = (date) => {
        if (!date) return "Chưa có thông tin";

        const d = new Date(date);
        if (isNaN(d.getTime())) return "Chưa có thông tin";

        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
    };

    if (loading) return <Loader text="Finding best bounties..." />;

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-8">
            {/* Compact Filter Bar */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-3 items-center sticky top-0 z-10">
                <Code className="text-red-500" size={20} />
                <span className="font-bold text-gray-700">Jobs</span>

                <div className="flex gap-2 ml-auto">
                    <select
                        name="category"
                        onChange={handleFilterChange}
                        className="px-3 py-1.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        <option value="">All Categories</option>
                        <option value="Web">Web Development</option>
                        <option value="Blockchain">Blockchain</option>
                        <option value="AI">AI / Machine Learning</option>
                        <option value="Mobile">Mobile App</option>
                    </select>

                    <select
                        name="status"
                        onChange={handleFilterChange}
                        className="px-3 py-1.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading bounties...</div>
            ) : issues.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    No issues found matching your criteria.
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <div
                            key={issue._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                        >
                            {/* Post Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {issue.clientId?.avatar ? (
                                        <img src={issue.clientId.avatar} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {issue.clientId?.name?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {issue.clientId?.name || 'Client'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500">
                                                {getRelativeTime(issue.createdAt)}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issue.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                                issue.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {issue.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                                    {issue.category || 'General'}
                                </span>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 pb-3">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {issue.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {issue.description}
                                </p>
                            </div>

                            {/* Image Preview - If attachments exist */}
                            {issue.attachments && issue.attachments.length > 0 && (
                                <div className="px-0">
                                    <img
                                        src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${issue.attachments[0]}`}
                                        alt="Attachment preview"
                                        className="w-full max-h-96 object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}

                            {/* Professional Bounty Section */}
                            <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    {/* Redesigned Bounty Badge */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-green-200">
                                            <p className="text-xs text-gray-500 mb-0.5">Bounty</p>
                                            <div className="flex items-baseline gap-1">
                                                <DollarSign size={18} className="text-green-600" />
                                                <span className="text-2xl font-bold text-green-600">{issue.bounty?.amount}</span>
                                                <span className="text-sm text-gray-600 font-medium">{issue.bounty?.currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/issue/${issue._id}`}
                                            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <Eye size={18} />
                                            View
                                        </Link>
                                        {user?.role === 'DEVELOPER' && issue.status === 'OPEN' && (
                                            <Link
                                                to={`/issue/${issue._id}`}
                                                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg"
                                            >
                                                <Send size={18} />
                                                Apply Now
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IssueList;
