import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp,
    DollarSign,
    Award,
    Calendar,
    BarChart3,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    LogOut,
    Loader2
} from 'lucide-react';

const Analytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalIssues: 0,
        openIssues: 0,
        ongoingIssues: 0,
        completedIssues: 0,
        totalBounty: 0,
        averageBounty: 0,
        recentActivity: [],
        categoryBreakdown: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/api/issues');
            const issues = res.data.data;

            const openIssues = issues.filter(i => i.status === 'OPEN');
            const ongoingIssues = issues.filter(i => i.status === 'ONGOING');
            const completedIssues = issues.filter(i => i.status === 'COMPLETED');

            const totalBounty = issues.reduce((sum, i) => sum + (parseFloat(i.bounty?.amount) || 0), 0);
            const averageBounty = issues.length > 0 ? totalBounty / issues.length : 0;

            const categoryBreakdown = {};
            issues.forEach(issue => {
                const cat = issue.category || 'Other';
                categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
            });

            const recentActivity = issues
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalIssues: issues.length,
                openIssues: openIssues.length,
                ongoingIssues: ongoingIssues.length,
                completedIssues: completedIssues.length,
                totalBounty: totalBounty.toFixed(2),
                averageBounty: averageBounty.toFixed(2),
                recentActivity,
                categoryBreakdown
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
    };

    const StatCard = ({ icon: Icon, label, value, color, borderColor }) => (
        <div className={`bg-[#1e293b] p-5 rounded-xl border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className={color} size={22} />
            </div>
            <p className={`text-3xl font-bold ${color === 'text-slate-400' ? 'text-white' : color}`}>{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
                <div className="text-center">
                    <Loader2 className="mx-auto text-indigo-500 animate-spin" size={48} />
                    <p className="text-slate-400 mt-4">Loading analytics...</p>
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
                            <Link
                                to="/admin/dashboard"
                                className="p-2 hover:bg-[#334155] rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-slate-400" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="text-indigo-400" size={28} />
                                    Analytics Dashboard
                                </h1>
                                <p className="text-sm text-slate-400">Track platform performance and insights</p>
                            </div>
                        </div>
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

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Award}
                        label="Total Jobs"
                        value={stats.totalIssues}
                        color="text-slate-400"
                        borderColor="border-[#334155]"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Open Jobs"
                        value={stats.openIssues}
                        color="text-emerald-400"
                        borderColor="border-emerald-500/20"
                    />
                    <StatCard
                        icon={Clock}
                        label="Ongoing"
                        value={stats.ongoingIssues}
                        color="text-indigo-400"
                        borderColor="border-indigo-500/20"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Completed"
                        value={stats.completedIssues}
                        color="text-purple-400"
                        borderColor="border-purple-500/20"
                    />
                </div>

                {/* Bounty Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <DollarSign className="text-white/80 mb-4" size={40} />
                        <p className="text-white/80 text-sm mb-2">Total Bounty Pool</p>
                        <p className="text-5xl font-bold text-white">{stats.totalBounty}</p>
                        <p className="text-white/80 mt-1">ETH</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="text-white/80 mb-4" size={40} />
                        <p className="text-white/80 text-sm mb-2">Average Bounty</p>
                        <p className="text-5xl font-bold text-white">{stats.averageBounty}</p>
                        <p className="text-white/80 mt-1">ETH per job</p>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users size={24} className="text-indigo-400" />
                        Jobs by Category
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                            <div key={category} className="p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-300">{category}</span>
                                    <span className="text-2xl font-bold text-indigo-400">{count}</span>
                                </div>
                                <div className="mt-3 bg-[#334155] rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(count / stats.totalIssues) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar size={24} className="text-indigo-400" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No recent activity</p>
                        ) : (
                            stats.recentActivity.map((issue) => (
                                <div key={issue._id} className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-xl border border-[#334155] hover:border-[#475569] transition-colors">
                                    <div className="flex-shrink-0">
                                        {issue.status === 'OPEN' && <AlertCircle className="text-emerald-400" size={24} />}
                                        {issue.status === 'ONGOING' && <Clock className="text-indigo-400" size={24} />}
                                        {issue.status === 'COMPLETED' && <CheckCircle className="text-purple-400" size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{issue.title}</p>
                                        <p className="text-xs text-slate-400">
                                            {issue.category} - {new Date(issue.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-400">
                                            {issue.bounty?.amount} {issue.bounty?.currency}
                                        </p>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            issue.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            issue.status === 'ONGOING' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155]">
                        <h3 className="text-sm font-medium text-slate-400 mb-2">Success Rate</h3>
                        <p className="text-3xl font-bold text-white">
                            {stats.totalIssues > 0 ? Math.round((stats.completedIssues / stats.totalIssues) * 100) : 0}%
                        </p>
                        <div className="mt-4 bg-[#334155] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.totalIssues > 0 ? (stats.completedIssues / stats.totalIssues) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155]">
                        <h3 className="text-sm font-medium text-slate-400 mb-2">In Progress</h3>
                        <p className="text-3xl font-bold text-white">
                            {stats.totalIssues > 0 ? Math.round((stats.ongoingIssues / stats.totalIssues) * 100) : 0}%
                        </p>
                        <div className="mt-4 bg-[#334155] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.totalIssues > 0 ? (stats.ongoingIssues / stats.totalIssues) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155]">
                        <h3 className="text-sm font-medium text-slate-400 mb-2">Available</h3>
                        <p className="text-3xl font-bold text-white">
                            {stats.totalIssues > 0 ? Math.round((stats.openIssues / stats.totalIssues) * 100) : 0}%
                        </p>
                        <div className="mt-4 bg-[#334155] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.totalIssues > 0 ? (stats.openIssues / stats.totalIssues) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
