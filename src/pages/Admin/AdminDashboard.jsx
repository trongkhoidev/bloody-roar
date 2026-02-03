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
    Download,
    RefreshCw,
    TrendingUp,
    Users,
    DollarSign,
    FileText
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

            // Calculate stats
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

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        // Search filter
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
        if (!window.confirm('⚠️ Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/api/issues/${issueId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchAllIssues();
            alert('✅ Post deleted successfully');
        } catch (error) {
            console.error('Error deleting issue:', error);
            alert('❌ Failed to delete post. Make sure you are logged in as admin@gmail.com');
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
            alert('❌ Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-green-100 text-green-700 border-green-200',
            'ONGOING': 'bg-blue-100 text-blue-700 border-blue-200',
            'COMPLETED': 'bg-gray-100 text-gray-700 border-gray-200',
            'PENDING_CONFIRM': 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="text-red-600 animate-spin" size={48} />
                    <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Shield className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                                <p className="text-sm text-gray-500">
                                    Welcome back, {localStorage.getItem('adminUsername') || 'Admin'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/admin/analytics"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-sm font-medium"
                            >
                                <TrendingUp size={18} />
                                <span className="hidden md:inline">Analytics</span>
                            </Link>
                            <button
                                onClick={fetchAllIssues}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <RefreshCw size={18} />
                                <span className="hidden md:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <FileText className="text-gray-400" size={24} />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">All Posts</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <TrendingUp className="text-green-500" size={24} />
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Open</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{stats.open}</p>
                        <p className="text-sm text-gray-500 mt-1">Available Jobs</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="text-blue-500" size={24} />
                            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Ongoing</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{stats.ongoing}</p>
                        <p className="text-sm text-gray-500 mt-1">In Progress</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <FileText className="text-gray-400" size={24} />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Done</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-700">{stats.completed}</p>
                        <p className="text-sm text-gray-500 mt-1">Completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-3">
                            <DollarSign className="text-white/80" size={24} />
                            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Value</span>
                        </div>
                        <p className="text-3xl font-bold">{stats.totalValue.toFixed(2)}</p>
                        <p className="text-sm text-white/80 mt-1">ETH Total Bounty</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title, description, or client..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="OPEN">Open</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING_CONFIRM">Pending</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Showing <span className="font-semibold text-gray-900">{filteredIssues.length}</span> of {issues.length} posts
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Job Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Bounty
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIssues.map((issue) => (
                                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="max-w-md">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {issue.title}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate mt-1">
                                                    {issue.description}
                                                </p>
                                                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                    {issue.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {issue.clientId?.name?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {issue.clientId?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">
                                                {issue.bounty?.amount} <span className="text-gray-500 font-normal">{issue.bounty?.currency}</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${getStatusBadge(issue.status)}`}
                                            >
                                                <option value="OPEN">OPEN</option>
                                                <option value="ONGOING">ONGOING</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="PENDING_CONFIRM">PENDING</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/issue/${issue._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(issue._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="text-gray-500 font-medium">No posts found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
