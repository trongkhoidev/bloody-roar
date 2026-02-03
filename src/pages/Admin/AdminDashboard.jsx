import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Shield,
    LogOut,
    Trash2,
    Eye,
    Search,
    Filter,
    RefreshCw,
    TrendingUp,
    Users,
    DollarSign,
    FileText,
    BarChart3,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        ongoing: 0,
        completed: 0,
        totalValue: 0
    });

    useEffect(() => {
        const isAdmin = localStorage.getItem('adminAuth');
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        fetchAllIssues();
    }, [navigate]);

    useEffect(() => {
        filterIssues();
    }, [searchTerm, statusFilter, issues]);

    const fetchAllIssues = async () => {
        try {
            const res = await axios.get('/api/issues');
            const issuesData = res.data.data;
            setIssues(issuesData);

            const stats = {
                total: issuesData.length,
                open: issuesData.filter(i => i.status === 'OPEN').length,
                ongoing: issuesData.filter(i => i.status === 'ONGOING').length,
                completed: issuesData.filter(i => i.status === 'COMPLETED').length,
                totalValue: issuesData.reduce((sum, i) => sum + (parseFloat(i.bounty?.amount) || 0), 0)
            };
            setStats(stats);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterIssues = () => {
        let filtered = issues;

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(i =>
                i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredIssues(filtered);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
    };

    const handleDelete = async (issueId) => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/api/issues/${issueId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchAllIssues();
            alert('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting issue:', error);
            alert('Failed to delete post. Make sure you are logged in as admin@gmail.com');
        }
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            await axios.patch(`/api/issues/${issueId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            fetchAllIssues();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'ONGOING': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'COMPLETED': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            'PENDING_CONFIRM': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
        return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-indigo-500 animate-spin" size={48} />
                    <p className="text-slate-400 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Header */}
            <div className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Shield className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                                <p className="text-sm text-slate-400">
                                    Welcome back, {localStorage.getItem('adminUsername') || 'Admin'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/admin/analytics"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 rounded-xl transition-all font-medium"
                            >
                                <BarChart3 size={18} />
                                <span className="hidden md:inline">Analytics</span>
                            </Link>
                            <button
                                onClick={fetchAllIssues}
                                className="flex items-center gap-2 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-xl transition-colors"
                            >
                                <RefreshCw size={18} />
                                <span className="hidden md:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-medium"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-3">
                            <FileText className="text-slate-400" size={22} />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-slate-400 mt-1">All Posts</p>
                    </div>

                    <div className="bg-[#1e293b] p-5 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <TrendingUp className="text-emerald-400" size={22} />
                            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Open</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-400">{stats.open}</p>
                        <p className="text-sm text-slate-400 mt-1">Available Jobs</p>
                    </div>

                    <div className="bg-[#1e293b] p-5 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="text-indigo-400" size={22} />
                            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">Ongoing</span>
                        </div>
                        <p className="text-3xl font-bold text-indigo-400">{stats.ongoing}</p>
                        <p className="text-sm text-slate-400 mt-1">In Progress</p>
                    </div>

                    <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-3">
                            <CheckCircle className="text-slate-400" size={22} />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Done</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-300">{stats.completed}</p>
                        <p className="text-sm text-slate-400 mt-1">Completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-xl shadow-lg shadow-indigo-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <DollarSign className="text-white/80" size={22} />
                            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Value</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalValue.toFixed(2)}</p>
                        <p className="text-sm text-white/80 mt-1">ETH Total Bounty</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title, description, or client..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="OPEN">Open</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING_CONFIRM">Pending</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-4">
                        Showing <span className="font-semibold text-white">{filteredIssues.length}</span> of {issues.length} posts
                    </p>
                </div>

                {/* Table */}
                <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0f172a] border-b border-[#334155]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Job Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Bounty
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#334155]">
                                {filteredIssues.map((issue) => (
                                    <tr key={issue._id} className="hover:bg-[#0f172a]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="max-w-md">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {issue.title}
                                                </p>
                                                <p className="text-sm text-slate-400 truncate mt-1">
                                                    {issue.description}
                                                </p>
                                                <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium bg-[#334155] text-slate-300 rounded-lg">
                                                    {issue.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                                    {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <span className="text-sm text-white font-medium">
                                                    {issue.clientId?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-amber-400">
                                                {issue.bounty?.amount} <span className="text-slate-400 font-normal">{issue.bounty?.currency}</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors bg-transparent ${getStatusBadge(issue.status)}`}
                                            >
                                                <option value="OPEN" className="bg-[#1e293b] text-white">OPEN</option>
                                                <option value="ONGOING" className="bg-[#1e293b] text-white">ONGOING</option>
                                                <option value="COMPLETED" className="bg-[#1e293b] text-white">COMPLETED</option>
                                                <option value="PENDING_CONFIRM" className="bg-[#1e293b] text-white">PENDING</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/issue/${issue._id}`}
                                                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(issue._id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Post"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredIssues.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                                <p className="text-slate-400 font-medium">No posts found</p>
                                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
