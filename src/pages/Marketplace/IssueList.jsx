import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Code, Search, Filter, DollarSign, Clock, Eye, Send, Users, Sparkles, TrendingUp, ChevronDown } from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

const IssueList = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: "", status: "", minBudget: "" });
    const [showFilters, setShowFilters] = useState(false);

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
        if (!date) return "Unknown";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Unknown";

        const seconds = Math.floor((new Date() - d) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval > 1) return interval + "y ago";
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + "mo ago";
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + "d ago";
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + "h ago";
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + "m ago";
        return "Just now";
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

    if (loading) return <Loader text="Finding bounties..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Sparkles className="text-indigo-400" size={24} />
                        </div>
                        Bounty Marketplace
                    </h1>
                    <p className="text-slate-400 mt-1">Discover opportunities and earn crypto</p>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-[#1e293b] rounded-xl border border-[#334155]">
                        <p className="text-xs text-slate-400">Open Bounties</p>
                        <p className="text-lg font-bold text-emerald-400">{issues.filter(i => i.status === 'OPEN').length}</p>
                    </div>
                    <div className="px-4 py-2 bg-[#1e293b] rounded-xl border border-[#334155]">
                        <p className="text-xs text-slate-400">Total Value</p>
                        <p className="text-lg font-bold text-amber-400">
                            {issues.reduce((acc, i) => acc + (i.bounty?.amount || 0), 0).toFixed(2)} ETH
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#334155]">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#334155] rounded-lg">
                            <Filter size={18} className="text-slate-400" />
                        </div>
                        <span className="font-semibold text-white">Filters</span>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden p-1 text-slate-400"
                        >
                            <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <div className={`flex flex-col md:flex-row gap-3 w-full md:w-auto ${showFilters ? 'block' : 'hidden md:flex'}`}>
                        <select
                            name="category"
                            onChange={handleFilterChange}
                            value={filter.category}
                            className="px-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            <option value="Web">Web Development</option>
                            <option value="Blockchain">Blockchain</option>
                            <option value="AI">AI / Machine Learning</option>
                            <option value="Mobile">Mobile App</option>
                            <option value="Game">Game Development</option>
                        </select>

                        <select
                            name="status"
                            onChange={handleFilterChange}
                            value={filter.status}
                            className="px-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="ONGOING">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>

                        {(filter.category || filter.status) && (
                            <button
                                onClick={() => setFilter({ category: "", status: "", minBudget: "" })}
                                className="px-4 py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Issue List */}
            {issues.length === 0 ? (
                <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-dashed border-[#334155]">
                    <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-lg">No bounties found</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {issues.map((issue, index) => (
                        <div
                            key={issue._id}
                            className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden hover:border-[#475569] transition-all duration-300 group animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Card Header */}
                            <div className="p-5 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    {/* Avatar */}
                                    {issue.clientId?.avatar ? (
                                        <img 
                                            src={issue.clientId.avatar} 
                                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0" 
                                            alt="Avatar" 
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {issue.clientId?.name?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white">
                                                {issue.clientId?.name || 'Client'}
                                            </span>
                                            <span className="text-slate-500 text-sm">
                                                {getRelativeTime(issue.createdAt)}
                                            </span>
                                            <span className={`badge ${getStatusBadge(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-white mt-2 group-hover:text-indigo-400 transition-colors">
                                            {issue.title}
                                        </h3>
                                        
                                        <p className="text-slate-400 text-sm leading-relaxed mt-2 line-clamp-2">
                                            {issue.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0 ${getCategoryColor(issue.category)}`}>
                                    {issue.category || 'General'}
                                </span>
                            </div>

                            {/* Image Preview */}
                            {issue.attachments && issue.attachments.length > 0 && (
                                <div className="px-5">
                                    <img
                                        src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${issue.attachments[0]}`}
                                        alt="Attachment"
                                        className="w-full max-h-64 object-cover rounded-xl border border-[#334155]"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}

                            {/* Card Footer */}
                            <div className="px-5 py-4 mt-2 bg-[#0f172a]/50 border-t border-[#334155] flex items-center justify-between gap-4">
                                {/* Bounty Badge */}
                                <div className="bounty-badge flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <DollarSign size={18} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Bounty</p>
                                        <p className="text-lg font-bold text-amber-400">
                                            {issue.bounty?.amount} <span className="text-sm text-slate-400">{issue.bounty?.currency}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Applicant Count */}
                                    {issue.applicationCount > 0 && (
                                        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
                                            <Users size={16} />
                                            <span>{issue.applicationCount} applicants</span>
                                        </div>
                                    )}

                                    <Link
                                        to={`/issue/${issue._id}`}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-white rounded-xl font-medium text-sm transition-all"
                                    >
                                        <Eye size={16} />
                                        View
                                    </Link>
                                    
                                    {user?.role === 'DEVELOPER' && issue.status === 'OPEN' && (
                                        <Link
                                            to={`/issue/${issue._id}`}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white rounded-xl font-semibold text-sm transition-all"
                                        >
                                            <Send size={16} />
                                            Apply
                                        </Link>
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

export default IssueList;
