import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    Send,
    Image as ImageIcon,
    Paperclip,
    Edit2,
    Trash2,
    Reply,
    X,
    Check,
    Lock
} from 'lucide-react';
import { useAuth } from '@app/context/AuthContext';

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
            setComments(res.data.data || []);
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
        const isOwner = user && (user._id === comment.userId?._id || user.id === comment.userId?._id);
        const isEditing = editingId === comment._id;

        return (
            <div className={`flex gap-3 ${isReply ? 'ml-10 md:ml-12 mt-3 pl-3 border-l border-border/40' : 'mt-5'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-[#00d68f] rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm border border-border/20">
                        {comment.userId?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-bg-elevated border border-border/60 rounded-2xl rounded-tl-none p-3.5 shadow-sm hover:border-border transition-colors">
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <span className="font-bold text-text-primary text-[13px]">
                                    {comment.userId?.name || 'Anonymous User'}
                                </span>
                                <span className="text-[10px] text-text-muted ml-2 font-medium">
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
                                        className="p-1 hover:bg-bg-secondary rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="p-1 hover:bg-red-500/10 rounded text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="mt-2 space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-3 bg-bg-secondary border border-border rounded-xl text-[13px] text-text-primary focus:outline-none focus:border-blue-500/80 resize-none transition-all"
                                    rows="2"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(comment._id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <Check size={13} /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditContent('');
                                        }}
                                        className="px-3 py-1.5 bg-bg-secondary hover:bg-bg-elevated border border-border text-text-secondary rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <X size={13} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>

                                {/* Attachments */}
                                {comment.attachments && comment.attachments.length > 0 && (
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        {comment.attachments.map((att, idx) => (
                                            <img
                                                key={idx}
                                                src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`}
                                                alt="attachment"
                                                className="max-w-xs max-h-48 rounded-xl border border-border/80"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {user && !isReply && (
                        <button
                            onClick={() => setReplyTo(comment._id)}
                            className="text-[11px] text-text-secondary hover:text-blue-400 mt-1.5 flex items-center gap-1 font-semibold transition-colors cursor-pointer ml-1"
                        >
                            <Reply size={13} /> Reply
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

    return (
        <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-xl w-full">
            <h3 className="text-base font-black text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                <MessageSquare size={16} className="text-blue-400" />
                Discussion ({comments.length})
            </h3>

            {/* New Comment Input Section */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6 border-b border-border/60 pb-6">
                    {replyTo && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 mb-3 flex items-center justify-between animate-fade-in">
                            <span className="text-[12px] font-semibold text-blue-400">Replying to comment</span>
                            <button
                                type="button"
                                onClick={() => setReplyTo(null)}
                                className="text-text-secondary hover:text-text-primary p-0.5"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTo ? "Write a dynamic reply..." : "Write a professional comment..."}
                        className="w-full p-4 bg-bg-elevated border border-border rounded-xl text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500/80 resize-none transition-all"
                        rows="3"
                    />

                    {attachments.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {attachments.map((att, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`}
                                        alt="preview"
                                        className="h-20 w-20 object-cover rounded-xl border border-border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                        className="absolute -top-2 -right-2 bg-bg-elevated border border-border text-text-primary rounded-full p-1 shadow-lg hover:text-red-400 cursor-pointer"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                            <label className="cursor-pointer p-2 hover:bg-bg-elevated border border-border/40 rounded-lg text-text-secondary hover:text-text-primary transition-all">
                                <ImageIcon size={18} />
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
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
                        >
                            <Send size={13} />
                            {loading ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 bg-bg-elevated/40 border border-border rounded-xl p-5 text-center flex flex-col items-center justify-center">
                    <Lock className="text-text-muted mb-2" size={20} />
                    <p className="text-text-secondary text-sm font-semibold">Join the Dynamic Discussion</p>
                    <p className="text-text-muted text-[12px] mt-0.5">
                        Please <Link to="/login" className="text-blue-400 hover:underline font-bold">log in</Link> to share insights or post a reply.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-1">
                {comments.length === 0 ? (
                    <div className="text-center py-10 bg-bg-elevated/20 border border-border/40 rounded-xl">
                        <MessageSquare className="mx-auto mb-2 text-text-muted" size={32} />
                        <p className="text-text-secondary text-sm font-semibold">No comments yet</p>
                        <p className="text-text-muted text-[11px] mt-0.5">Be the first to claim and start the conversation!</p>
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

