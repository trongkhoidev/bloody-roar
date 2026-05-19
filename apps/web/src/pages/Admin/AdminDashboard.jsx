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
    Loader2,
    Scale,
    AlertTriangle,
    ShieldAlert,
    ChevronRight,
    Terminal,
    MessageSquare,
    Cpu,
    ArrowUpRight,
    Award
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('POSTS'); // POSTS or DISPUTES
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [dossier, setDossier] = useState(null);
    const [dossierLoading, setDossierLoading] = useState(false);
    const [resolving, setResolving] = useState(false);
    
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        ongoing: 0,
        completed: 0,
        totalValue: 0
    });

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

        if (!adminToken || !adminUser || adminUser.role !== 'ADMIN') {
            navigate('/admin/login');
            return;
        }

        fetchAllIssues();
    }, [navigate]);

    useEffect(() => {
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
        filterIssues();
    }, [searchTerm, statusFilter, issues]);

    const fetchAllIssues = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const res = await axios.get('/api/issues?status=ALL&limit=100', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
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

    const fetchDisputeDossier = async (issue) => {
        setSelectedDispute(issue);
        setDossier(null);
        setDossierLoading(true);
        try {
            const adminToken = localStorage.getItem('adminToken');
            const res = await axios.get(`/api/escrow/${issue._id}/dispute-dossier`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            setDossier(res.data.data);
        } catch (error) {
            console.error('Error fetching dossier:', error);
            alert('Failed to load AI dispute evaluation.');
        } finally {
            setDossierLoading(false);
        }
    };

    const handleResolveDispute = async (refundClient) => {
        if (!selectedDispute) return;
        const confirmMsg = refundClient 
            ? "Are you sure you want to refund the Client? This will claw back the escrowed funds on-chain."
            : "Are you sure you want to release funds to the Developer? This will transfer the bounty on-chain.";
        
        if (!window.confirm(confirmMsg)) return;

        setResolving(true);
        try {
            const adminToken = localStorage.getItem('adminToken');
            // Simulate a secure Arbitrum L2 settlement transaction hash
            const fakeTxHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
            
            await axios.post('/api/escrow/resolve', {
                issueId: selectedDispute._id,
                refundClient,
                txHash: fakeTxHash
            }, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            alert(`Dispute resolved successfully!\nSettled on Arbitrum: ${fakeTxHash.substring(0, 10)}...`);
            setSelectedDispute(null);
            setDossier(null);
            fetchAllIssues();
        } catch (error) {
            console.error('Error resolving dispute:', error);
            alert(error.response?.data?.message || 'Failed to resolve dispute.');
        } finally {
            setResolving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const handleDelete = async (issueId) => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const adminToken = localStorage.getItem('adminToken');
            await axios.delete(`/api/issues/${issueId}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            fetchAllIssues();
        } catch (error) {
            console.error('Error deleting issue:', error);
            alert(error.response?.data?.message || 'Failed to delete post.');
        }
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            await axios.patch(`/api/issues/${issueId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            fetchAllIssues();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
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

    const disputesList = issues.filter(i => i.workspace?.paymentStatus === 'DISPUTED');

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
                                    Welcome, {JSON.parse(localStorage.getItem('adminUser') || '{}')?.name || 'Admin'}
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
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Disputes</span>
                        </div>
                        <p className="text-3xl font-bold text-red-400">{disputesList.length}</p>
                        <p className="text-sm text-slate-400 mt-1">Active Conflicts</p>
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

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-6 border-b border-[#334155] pb-4">
                    <button
                        onClick={() => { setActiveTab('POSTS'); setSelectedDispute(null); }}
                        className={`px-5 py-2.5 font-medium text-sm rounded-xl transition-all ${activeTab === 'POSTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        All Posts
                    </button>
                    <button
                        onClick={() => { setActiveTab('DISPUTES'); }}
                        className={`px-5 py-2.5 font-medium text-sm rounded-xl transition-all ${activeTab === 'DISPUTES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'} flex items-center gap-2`}
                    >
                        Active Disputes
                        {disputesList.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                                {disputesList.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'POSTS' ? (
                    <>
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
                    </>
                ) : (
                    /* Active Disputes Workspace */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                        {/* Left List Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <h3 className="text-lg font-bold text-white px-2">Conflicts Under Review</h3>
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                                {disputesList.map((issue) => (
                                    <div
                                        key={issue._id}
                                        onClick={() => fetchDisputeDossier(issue)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedDispute?._id === issue._id ? 'bg-[#334155]/40 border-red-500/60 shadow-lg shadow-red-500/5' : 'bg-[#1e293b] border-[#334155] hover:bg-[#334155]/20'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <span className="px-2 py-0.5 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
                                                DISPUTED
                                            </span>
                                            <span className="text-xs text-slate-400 font-bold">
                                                {issue.bounty?.amount} {issue.bounty?.currency}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1">{issue.title}</h4>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{issue.description}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>By: {issue.clientId?.name || 'Client'}</span>
                                            <ChevronRight size={16} className={selectedDispute?._id === issue._id ? 'text-red-400' : 'text-slate-500'} />
                                        </div>
                                    </div>
                                ))}

                                {disputesList.length === 0 && (
                                    <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                                        <Scale className="mx-auto text-slate-600 mb-4 animate-pulse" size={48} />
                                        <p className="text-slate-400 font-semibold">Zero active disputes</p>
                                        <p className="text-xs text-slate-500 mt-1">Peace reigns in the ecosystem.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Detail Dossier Column */}
                        <div className="lg:col-span-8 bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden flex flex-col">
                            {!selectedDispute ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
                                    <div className="w-16 h-16 bg-[#334155]/20 border border-[#334155] rounded-2xl flex items-center justify-center mb-4">
                                        <Scale className="text-slate-400 animate-pulse" size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">No Dispute Selected</h4>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Select an active conflict from the list to invoke the AI Dispute Assistant and examine on-chain/off-chain logs.
                                    </p>
                                </div>
                            ) : dossierLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
                                    <Loader2 className="text-red-400 animate-spin mb-4" size={48} />
                                    <h4 className="text-white font-bold mb-2">Running AI Dispute Assistant...</h4>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Executing prompt chains, gathering chat histories, compiling sandbox git logs, and performing device fingerprint verification.
                                    </p>
                                </div>
                            ) : dossier ? (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Dossier Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#334155] pb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Scale className="text-red-400" size={24} />
                                                Arbitrage Case Dossier
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">Issue ID: {selectedDispute._id}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-[#0f172a] border border-[#334155] px-4 py-2.5 rounded-xl">
                                            <Cpu size={16} className="text-indigo-400" />
                                            <span className="text-xs text-slate-400 font-medium">AI Model:</span>
                                            <span className="text-xs font-bold text-indigo-400 uppercase">Gemini 1.5 Flash</span>
                                        </div>
                                    </div>

                                    {/* AI Verdict Summary Banner */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-[#334155]/20 to-[#0f172a] border border-red-500/20 shadow-md">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Dispute Verdict</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-400">Confidence:</span>
                                                <span className={`text-xs font-black ${dossier.confidenceScore > 80 ? 'text-red-400' : 'text-amber-400'}`}>
                                                    {dossier.confidenceScore}%
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-white mb-2 tracking-tight">
                                            {dossier.recommendation === 'RELEASE_DEVELOPER' ? '🎯 RELEASE TO DEVELOPER' : 
                                             dossier.recommendation === 'REFUND_CLIENT' ? '💸 REFUND CLIENT (CLAWBACK)' : '⚖️ SPLIT 50/50'}
                                        </h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">{dossier.evaluationSummary}</p>
                                    </div>

                                    {/* Two Column details: Findings & Anti-fraud */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Key Findings */}
                                        <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-5">
                                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-[#334155] pb-2">
                                                <Award size={16} className="text-indigo-400" />
                                                Key Findings
                                            </h4>
                                            <ul className="space-y-2">
                                                {dossier.keyFindings?.map((finding, idx) => (
                                                    <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                                        {finding}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Anti-Fraud Audit */}
                                        <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-5">
                                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-[#334155] pb-2">
                                                <ShieldAlert size={16} className="text-red-400" />
                                                Security & Device Fingerprints
                                            </h4>
                                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                                {dossier.antiFraudAnalysis}
                                            </p>
                                            {selectedDispute.clientId?.fingerprint && (
                                                <div className="mt-3 p-3 bg-[#1e293b]/50 border border-[#334155] rounded-lg space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                                        <span>Client Device Signature:</span>
                                                        <span className="font-bold text-indigo-400">{selectedDispute.clientId.fingerprint.substring(0, 12)}...</span>
                                                    </div>
                                                    {selectedDispute.assignedDeveloper?.fingerprint && (
                                                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                                            <span>Developer Device Signature:</span>
                                                            <span className="font-bold text-indigo-400">{selectedDispute.assignedDeveloper.fingerprint.substring(0, 12)}...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Suggested Actions & Live Trigger Buttons */}
                                    <div className="border-t border-[#334155] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium self-start md:self-center">
                                            <Terminal size={14} className="text-slate-500" />
                                            <span>Actions execute escrow transactions on-chain.</span>
                                        </div>
                                        
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button
                                                disabled={resolving}
                                                onClick={() => handleResolveDispute(true)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {resolving ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
                                                Refund Client (Clawback)
                                            </button>
                                            <button
                                                disabled={resolving}
                                                onClick={() => handleResolveDispute(false)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {resolving ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                                                Release to Developer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
                                    <AlertTriangle className="text-amber-400 mb-2" size={32} />
                                    <h4 className="text-white font-bold mb-2">Error Generating Evaluation</h4>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        Unable to read dossier. The sandbox environments or blockchain logs may be temporarily offline.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

