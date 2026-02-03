import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Calendar,
    DollarSign,
    Eye,
    Trash2,
    Edit,
    CheckCircle,
    Clock,
    AlertCircle,
    Users,
    MessageSquare,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyPosts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, ONGOING, COMPLETED

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            const res = await axios.get('/api/issues', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Filter only posts created by current user
            const myPosts = res.data.data.filter(issue =>
                issue.clientId._id === user._id || issue.clientId === user._id
            );
            setPosts(myPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await axios.delete(`/api/issues/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPosts(posts.filter(p => p._id !== id));
            alert('Post deleted successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/api/issues/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setPosts(posts.map(p => p._id === id ? { ...p, status: newStatus } : p));
            alert('Status updated successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredPosts = filter === 'ALL'
        ? posts
        : posts.filter(p => p.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-green-100 text-green-700';
            case 'ONGOING': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle size={20} className="text-green-600" />;
            case 'ONGOING': return <Clock size={20} className="text-blue-600" />;
            case 'COMPLETED': return <CheckCircle size={20} className="text-purple-600" />;
            default: return <Briefcase size={20} className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Briefcase className="mx-auto text-red-600 animate-pulse" size={48} />
                    <p className="text-gray-600 mt-4">Loading your posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Briefcase className="text-red-600" size={32} />
                            My Job Posts
                        </h1>
                        <p className="text-gray-600">Manage all your posted jobs in one place</p>
                    </div>
                    <button
                        onClick={() => navigate('/post-job')}
                        className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
                    >
                        <PlusCircle size={20} />
                        Post New Job
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <Briefcase className="text-gray-600" size={24} />
                        <span className="text-2xl font-bold text-gray-900">{posts.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Total Posts</p>
                </div>
                <div className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="text-green-600" size={24} />
                        <span className="text-2xl font-bold text-green-600">
                            {posts.filter(p => p.status === 'OPEN').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Open</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-blue-600" size={24} />
                        <span className="text-2xl font-bold text-blue-600">
                            {posts.filter(p => p.status === 'ONGOING').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Ongoing</p>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="text-purple-600" size={24} />
                        <span className="text-2xl font-bold text-purple-600">
                            {posts.filter(p => p.status === 'COMPLETED').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Completed</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    {['ALL', 'OPEN', 'ONGOING', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === status
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <Briefcase className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'ALL'
                            ? "You haven't posted any jobs yet. Start by creating your first job post!"
                            : `No ${filter.toLowerCase()} jobs found.`
                        }
                    </p>
                    {filter === 'ALL' && (
                        <button
                            onClick={() => navigate('/post-job')}
                            className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
                        >
                            <PlusCircle size={20} />
                            Create First Job
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPosts.map(post => (
                        <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                            {/* Post Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {getStatusIcon(post.status)}
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {post.title}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {post.description}
                                        </p>
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={14} />
                                                {post.bounty?.amount} {post.bounty?.currency}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {post.applications?.length || 0} applicants
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            to={`/issue/${post._id}`}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} className="text-gray-600" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={18} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-medium">Change Status:</span>
                                    <select
                                        value={post.status}
                                        onChange={(e) => handleStatusChange(post._id, e.target.value)}
                                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <Link
                                    to={`/issue/${post._id}`}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    <MessageSquare size={14} />
                                    View Applications ({post.applications?.length || 0})
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
