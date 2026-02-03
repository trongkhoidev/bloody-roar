import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquare,
    Send,
    Image as ImageIcon,
    Paperclip,
    Edit2,
    Trash2,
    Reply,
    X,
    Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CommentSection = ({ issueId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [issueId]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`/api/issues/${issueId}/comments`);
            setComments(res.data.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleFileUpload = async (files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('file', file);
        });

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAttachments([...attachments, res.data.url]);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await axios.post(
                `/api/issues/${issueId}/comments`,
                {
                    content: newComment,
                    attachments,
                    parentId: replyTo
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setNewComment('');
            setAttachments([]);
            setReplyTo(null);
            fetchComments();
        } catch (error) {
            console.error('Error creating comment:', error);
            alert('Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (commentId) => {
        try {
            await axios.patch(
                `/api/comments/${commentId}`,
                { content: editContent },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setEditingId(null);
            setEditContent('');
            fetchComments();
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Failed to update comment');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await axios.delete(`/api/comments/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    const formatDate = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diff = Math.floor((now - commentDate) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

        return commentDate.toLocaleDateString();
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isOwner = user?._id === comment.userId?._id;
        const isEditing = editingId === comment._id;

        return (
            <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                        {comment.userId?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <span className="font-semibold text-gray-900 text-sm">
                                    {comment.userId?.name}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                    {formatDate(comment.createdAt)}
                                    {comment.isEdited && ' (edited)'}
                                </span>
                            </div>
                            {isOwner && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingId(comment._id);
                                            setEditContent(comment.content);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Edit2 size={14} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                    >
                                        <Trash2 size={14} className="text-red-600" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows="2"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleEdit(comment._id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <Check size={14} /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditContent('');
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 flex items-center gap-1"
                                    >
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {comment.content}
                                </p>

                                {/* Attachments */}
                                {comment.attachments && comment.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {comment.attachments.map((att, idx) => (
                                            <img
                                                key={idx}
                                                src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`}
                                                alt="attachment"
                                                className="max-w-xs max-h-48 rounded-lg border border-gray-200"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isReply && (
                        <button
                            onClick={() => setReplyTo(comment._id)}
                            className="text-xs text-gray-500 hover:text-red-600 mt-1 flex items-center gap-1"
                        >
                            <Reply size={14} /> Reply
                        </button>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.map(reply => (
                        <CommentItem key={reply._id} comment={reply} isReply />
                    ))}
                </div>
            </div>
        );
    };

    if (!user) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">Please login to view and post comments</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Discussion ({comments.length})
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                {replyTo && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-2 mb-2 flex items-center justify-between">
                        <span className="text-sm text-blue-700">Replying to comment</span>
                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="text-blue-700 hover:text-blue-900"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                />

                {attachments.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative">
                                <img
                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`}
                                    alt="preview"
                                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ImageIcon size={20} className="text-gray-600" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files)}
                                className="hidden"
                                multiple
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        <Send size={16} />
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-1">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="mx-auto mb-2 text-gray-300" size={48} />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
