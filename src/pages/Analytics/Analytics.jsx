import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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
    XCircle,
    AlertCircle,
    ArrowLeft,
    LogOut
} from 'lucide-react';

const Analytics = () => {
    const { user } = useAuth();
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
            // Fetch all issues
            const res = await axios.get('/api/issues');
            const issues = res.data.data;

            // Calculate stats
            const openIssues = issues.filter(i => i.status === 'OPEN');
            const ongoingIssues = issues.filter(i => i.status === 'ONGOING');
            const completedIssues = issues.filter(i => i.status === 'COMPLETED');

            const totalBounty = issues.reduce((sum, i) => sum + (parseFloat(i.bounty?.amount) || 0), 0);
            const averageBounty = issues.length > 0 ? totalBounty / issues.length : 0;

            // Category breakdown
            const categoryBreakdown = {};
            issues.forEach(issue => {
                const cat = issue.category || 'Other';
                categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
            });

            // Recent activity (last 5)
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

    const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
        <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-100`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className={color} size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <BarChart3 className="mx-auto text-red-600 animate-pulse" size={48} />
                    <p className="text-gray-600 mt-4">Loading analytics...</p>
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
                            <Link
                                to="/admin/dashboard"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <BarChart3 className="text-red-600" size={28} />
                                    Analytics Dashboard
                                </h1>
                                <p className="text-sm text-gray-500">Track platform performance and insights</p>
                            </div>
                        </div>
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

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <StatCard
                    icon={Award}
                    label="Total Jobs"
                    value={stats.totalIssues}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Open Jobs"
                    value={stats.openIssues}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    icon={Clock}
                    label="Ongoing"
                    value={stats.ongoingIssues}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Completed"
                    value={stats.completedIssues}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Bounty Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-xl shadow-lg text-white">
                    <DollarSign className="mb-4" size={40} />
                    <p className="text-white/80 text-sm mb-2">Total Bounty Pool</p>
                    <p className="text-5xl font-bold">{stats.totalBounty}</p>
                    <p className="text-white/80 mt-1">ETH</p>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 rounded-xl shadow-lg text-white">
                    <BarChart3 className="mb-4" size={40} />
                    <p className="text-white/80 text-sm mb-2">Average Bounty</p>
                    <p className="text-5xl font-bold">{stats.averageBounty}</p>
                    <p className="text-white/80 mt-1">ETH per job</p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users size={24} className="text-red-600" />
                    Jobs by Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                        <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{category}</span>
                                <span className="text-2xl font-bold text-red-600">{count}</span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                                    style={{ width: `${(count / stats.totalIssues) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar size={24} className="text-red-600" />
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {stats.recentActivity.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recent activity</p>
                    ) : (
                        stats.recentActivity.map((issue) => (
                            <div key={issue._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0">
                                    {issue.status === 'OPEN' && <AlertCircle className="text-green-600" size={24} />}
                                    {issue.status === 'ONGOING' && <Clock className="text-blue-600" size={24} />}
                                    {issue.status === 'COMPLETED' && <CheckCircle className="text-purple-600" size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {issue.category} • {new Date(issue.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">
                                        {issue.bounty?.amount} {issue.bounty?.currency}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${issue.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                        issue.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                            'bg-purple-100 text-purple-700'
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Success Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.totalIssues > 0 ? Math.round((stats.completedIssues / stats.totalIssues) * 100) : 0}%
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full"
                            style={{ width: `${stats.totalIssues > 0 ? (stats.completedIssues / stats.totalIssues) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">In Progress</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.totalIssues > 0 ? Math.round((stats.ongoingIssues / stats.totalIssues) * 100) : 0}%
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 h-full rounded-full"
                            style={{ width: `${stats.totalIssues > 0 ? (stats.ongoingIssues / stats.totalIssues) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Available</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.totalIssues > 0 ? Math.round((stats.openIssues / stats.totalIssues) * 100) : 0}%
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full"
                            style={{ width: `${stats.totalIssues > 0 ? (stats.openIssues / stats.totalIssues) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
