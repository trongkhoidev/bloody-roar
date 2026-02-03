import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
    Code, Search, Filter, DollarSign, Clock, Eye, Send, Users, 
    Sparkles, TrendingUp, ChevronDown, Zap, ArrowRight, 
    Globe, Cpu, Smartphone, Gamepad2, LayoutGrid, List
} from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

const IssueList = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: "", status: "", minBudget: "" });
    const [viewMode, setViewMode] = useState("grid"); // grid or list

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

    const stats = {
        open: issues.filter(i => i.status === 'OPEN').length,
        totalValue: issues.reduce((acc, i) => acc + (i.bounty?.amount || 0), 0),
        totalBounties: issues.length
    };

    if (loading) return <Loader text="Loading bounties..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] border border-[#262626] p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNjI2MjYiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                
                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-[#00d68f] animate-pulse" />
                                <span className="text-[12px] text-[#a1a1aa] font-medium">Live Marketplace</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                Bounty Marketplace
                            </h1>
                            <p className="text-[#a1a1aa] text-base max-w-lg">
                                Discover opportunities, complete tasks, and earn crypto rewards from top clients worldwide.
                            </p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="flex gap-3">
                            <div className="px-5 py-4 bg-[#171717] rounded-xl border border-[#262626] min-w-[120px]">
                                <p className="text-[11px] text-[#71717a] uppercase tracking-wider font-medium mb-1">Open</p>
                                <p className="text-2xl font-bold text-[#00d68f]">{stats.open}</p>
                            </div>
                            <div className="px-5 py-4 bg-[#171717] rounded-xl border border-[#262626] min-w-[140px]">
                                <p className="text-[11px] text-[#71717a] uppercase tracking-wider font-medium mb-1">Total Value</p>
                                <p className="text-2xl font-bold bounty-text">{stats.totalValue.toFixed(2)} ETH</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        name="category"
                        onChange={handleFilterChange}
                        value={filter.category}
                        className="px-3 py-2 bg-[#171717] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#404040] text-[13px] cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        <option value="Web">Web Development</option>
                        <option value="Blockchain">Blockchain</option>
                        <option value="AI">AI / ML</option>
                        <option value="Mobile">Mobile App</option>
                        <option value="Game">Game Dev</option>
                    </select>

                    <select
                        name="status"
                        onChange={handleFilterChange}
                        value={filter.status}
                        className="px-3 py-2 bg-[#171717] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#404040] text-[13px] cursor-pointer min-w-[120px]"
                    >
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="ONGOING">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    {(filter.category || filter.status) && (
                        <button
                            onClick={() => setFilter({ category: "", status: "", minBudget: "" })}
                            className="px-3 py-2 text-[#a1a1aa] hover:text-white text-[13px] transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#171717] rounded-lg border border-[#262626]">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#262626] text-white' : 'text-[#71717a] hover:text-white'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#262626] text-white' : 'text-[#71717a] hover:text-white'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Issue Grid/List */}
            {issues.length === 0 ? (
                <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-dashed border-[#262626]">
                    <div className="w-14 h-14 bg-[#171717] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={22} className="text-[#71717a]" />
                    </div>
                    <p className="text-[#a1a1aa] text-lg font-medium">No bounties found</p>
                    <p className="text-[#71717a] text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issues.map((issue, index) => (
                        <Link
                            key={issue._id}
                            to={`/issue/${issue._id}`}
                            className="group bg-[#0a0a0a] rounded-xl border border-[#262626] overflow-hidden hover:border-[#404040] transition-all duration-200 animate-slide-up flex flex-col"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Card Header */}
                            <div className="p-5 flex-1">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${getCategoryClass(issue.category)} flex items-center gap-1.5`}>
                                            {getCategoryIcon(issue.category)}
                                            {issue.category || 'General'}
                                        </span>
                                        <span className={`badge ${getStatusBadge(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-[#71717a]">
                                        {getRelativeTime(issue.createdAt)}
                                    </span>
                                </div>
                                
                                <h3 className="text-[15px] font-semibold text-white mb-2 group-hover:text-[#0070f3] transition-colors line-clamp-2">
                                    {issue.title}
                                </h3>
                                
                                <p className="text-[13px] text-[#a1a1aa] leading-relaxed line-clamp-2">
                                    {issue.description}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-4 bg-[#111] border-t border-[#262626] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-[#f5a623]" />
                                    <span className="text-lg font-bold bounty-text">
                                        {issue.bounty?.amount}
                                    </span>
                                    <span className="text-[13px] text-[#71717a]">{issue.bounty?.currency}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-[#71717a]">
                                    <Users size={14} />
                                    <span className="text-[12px]">{issue.applicationCount || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {issues.map((issue, index) => (
                        <Link
                            key={issue._id}
                            to={`/issue/${issue._id}`}
                            className="group flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-[#262626] hover:border-[#404040] transition-all duration-200 animate-slide-up"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                {issue.clientId?.name?.charAt(0) || 'C'}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-[14px] font-medium text-white group-hover:text-[#0070f3] transition-colors truncate">
                                        {issue.title}
                                    </h3>
                                    <span className={`badge ${getStatusBadge(issue.status)} text-[10px]`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-[12px] text-[#71717a] truncate">
                                    {issue.clientId?.name} &bull; {getRelativeTime(issue.createdAt)} &bull; {issue.applicationCount || 0} applications
                                </p>
                            </div>
                            
                            {/* Category */}
                            <span className={`hidden md:flex badge ${getCategoryClass(issue.category)} items-center gap-1.5`}>
                                {getCategoryIcon(issue.category)}
                                {issue.category || 'General'}
                            </span>
                            
                            {/* Bounty */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] rounded-lg border border-[#262626]">
                                <DollarSign size={14} className="text-[#f5a623]" />
                                <span className="font-semibold bounty-text">{issue.bounty?.amount}</span>
                                <span className="text-[11px] text-[#71717a]">{issue.bounty?.currency}</span>
                            </div>
                            
                            {/* Arrow */}
                            <ArrowRight size={16} className="text-[#71717a] group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IssueList;
