import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { DollarSign, Users, Globe, Cpu, Sparkles, Smartphone, Gamepad2, Code, MessageSquare, Send, ThumbsUp, Share2, Loader2, Check, X, ExternalLink } from "lucide-react";
import { useAuth } from "@app/context/AuthContext";
import axios from "axios";

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
        case 'OPEN': return 'badge-open';
        case 'ONGOING': return 'badge-ongoing';
        case 'COMPLETED': return 'badge-completed';
        default: return 'badge-completed';
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
    return classes[category] || 'bg-[#262626] text-text-secondary ';
};

const InlineComments = ({ issueId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/issues/${issueId}/comments`);
                setComments(res.data.data || []);
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [issueId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        setPosting(true);
        try {
            const res = await axios.post(`/api/issues/${issueId}/comments`, { content: newComment }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setComments([res.data.data, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error("Error posting comment", error);
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <div className="py-4 text-center text-text-muted text-sm flex justify-center"><Loader2 size={16} className="animate-spin" /></div>;

    const displayedComments = showAll ? comments : comments.slice(0, 2);

    return (
        <div className="pt-3 ">
            {/* Comment List */}
            <div className="space-y-3 mb-3">
                {displayedComments.map(comment => (
                    <div key={comment._id} className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0070f3] to-[#3291ff] flex items-center justify-center text-text-primary text-xs font-bold shrink-0">
                            {comment.userId?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="bg-bg-elevated rounded-2xl rounded-tl-none px-3.5 py-2 inline-block max-w-[90%]">
                                <span className="font-semibold text-text-primary text-[13px] mr-2">{comment.userId?.name}</span>
                                <span className="text-text-primary text-[13px] whitespace-pre-wrap">{comment.content}</span>
                            </div>
                            <div className="text-[11px] text-text-muted mt-1 ml-2">
                                {getRelativeTime(comment.createdAt)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {comments.length > 2 && !showAll && (
                <button onClick={() => setShowAll(true)} className="text-[13px] text-text-secondary hover:text-text-primary font-medium mb-3 ml-1 transition-colors">
                    View {comments.length - 2} more comments
                </button>
            )}

            {/* Post Comment Input */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-2.5 items-center mt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-text-primary text-xs font-bold shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-bg-elevated rounded-full pl-4 pr-10 py-2 text-[13px] text-text-primary focus:outline-none focus: transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || posting}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors p-1"
                        >
                            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-2 text-[13px] text-text-muted">
                    Please <Link to="/login" className="text-blue-400 hover:underline">log in</Link> to join the discussion.
                </div>
            )}
        </div>
    );
};

export const IssueCard = ({ issue, index }) => {
    const [isReadMore, setIsReadMore] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    // Check if content is long
    const isLongText = issue.description && issue.description.length > 250;

    return (
        <div
            className="bg-bg-card rounded-xl overflow-hidden animate-slide-up flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Header: Author & Meta */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#00d68f] flex items-center justify-center text-text-primary font-medium text-sm flex-shrink-0">
                        {issue.clientId?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[14px] font-semibold text-text-primary">
                                {issue.clientId?.name || 'Anonymous Client'}
                            </h3>
                            <span className="text-text-muted text-xs">&bull;</span>
                            <span className="text-xs text-text-secondary">{getRelativeTime(issue.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`badge ${getCategoryClass(issue.category)} !px-1.5 !py-0.5 !text-[10px] flex items-center gap-1`}>
                                {getCategoryIcon(issue.category)}
                                {issue.category || 'General'}
                            </span>
                            <span className={`badge ${getStatusBadge(issue.status)} !px-1.5 !py-0.5 !text-[10px]`}>
                                {issue.status}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Right side: Bounty Amount */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 bg-bg-elevated px-3 py-1.5 rounded-lg ">
                        <DollarSign size={14} className="text-[#f5a623]" />
                        <span className="font-bold bounty-text text-[15px]">{issue.bounty?.amount}</span>
                        <span className="text-[11px] text-text-muted">{issue.bounty?.currency}</span>
                    </div>
                </div>
            </div>

            {/* Body: Title & Content */}
            <div className="px-4 pb-3">
                <Link to={`/issue/${issue._id}`} className="block group">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-[17px] font-bold text-text-primary group-hover:text-blue-400 transition-colors">
                            {issue.title}
                        </h2>
                        <span className="text-[11px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded ">
                            #{issue._id.substring(issue._id.length - 6).toUpperCase()}
                        </span>
                    </div>
                </Link>
                <div className="text-[14px] text-text-primary leading-relaxed whitespace-pre-wrap">
                    {isLongText && !isReadMore
                        ? `${issue.description.substring(0, 250)}...`
                        : issue.description}

                    {isLongText && (
                        <button
                            onClick={() => setIsReadMore(!isReadMore)}
                            className="ml-1 text-blue-400 hover:text-blue-300 font-medium text-[14px]"
                        >
                            {isReadMore ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>

                {/* Tech Tags / Skills */}
                {issue.tags && issue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {issue.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 bg-bg-elevated border border-border/60 hover:border-border-hover/60 rounded-md text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Attachments / Images */}
                {issue.attachments && issue.attachments.length > 0 && (
                    <div className={`mt-3 ${issue.attachments.length === 1 ? 'w-full' : 'grid grid-cols-2 gap-2'}`}>
                        {issue.attachments.map((att, idx) => (
                            <div key={idx} className={`relative overflow-hidden rounded-xl ${issue.attachments.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                                <img
                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`}
                                    alt={`Attachment ${idx + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/600x400?text=File+Attachment';
                                    }}
                                    onClick={() => setActiveImage(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}${att}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interaction Stats */}
            <div className="px-4 py-2 mx-4 flex items-center justify-between text-text-secondary text-[13px]">
                <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-blue-500/25 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-[#00d68f]" />
                    </div>
                    <span>{issue.applicationCount || 0} applications</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                        {issue.comments?.length || "0"} comments
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 mx-4 flex items-center justify-between">
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded-lg transition-colors text-[14px] font-medium"
                >
                    <MessageSquare size={18} />
                    Comment
                </button>
                <Link
                    to={`/issue/${issue._id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded-lg transition-colors text-[14px] font-medium"
                >
                    <Share2 size={18} />
                    Details
                </Link>
                <Link
                    to={`/issue/${issue._id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-[14px] font-medium"
                >
                    <Code size={18} />
                    Apply
                </Link>
            </div>

            {/* Inline Comments Section */}
            {showComments && (
                <div className="px-4 pb-4">
                    <InlineComments issueId={issue._id} />
                </div>
            )}

            {/* Lightbox Modal via Portal */}
            {activeImage && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 animate-fade"
                    onClick={() => setActiveImage(null)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 -white/10 text-text-primary/80 hover:text-text-primary transition-all cursor-pointer z-[100000] shadow-lg"
                        onClick={() => setActiveImage(null)}
                    >
                        <X size={24} />
                    </button>

                    {/* Image Container with Zoom & Pop effect */}
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                    >
                        <img
                            src={activeImage}
                            alt="Enlarged Attachment"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl -white/5 animate-zoom"
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
