import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Flame, Zap, DollarSign, MessageSquare, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { IssueStatus } from "@bloody-roar/shared-types";

export const IssueBanners = ({ issues }) => {
    // Collect 5 Sponsored posts and up to 15 Hot posts
    const featuredIssues = React.useMemo(() => {
        if (!issues) return [];

        // Filter open issues and prioritize those with active comments first to showcase the split discussion layout
        const openIssues = [...issues].filter(i => i.status === IssueStatus.OPEN);

        const sorted = openIssues.sort((a, b) => {
            const hasCommentsA = (a.comments?.length || 0) > 0 ? 1 : 0;
            const hasCommentsB = (b.comments?.length || 0) > 0 ? 1 : 0;

            if (hasCommentsA !== hasCommentsB) {
                return hasCommentsB - hasCommentsA; // Posts with comments first
            }

            // Tie breaker: prioritize total engagement (comments + applications)
            const scoreA = (a.applicationCount || 0) + (a.comments?.length || 0);
            const scoreB = (b.applicationCount || 0) + (b.comments?.length || 0);
            return scoreB - scoreA;
        });

        // Map Sponsored / Trending flags dynamically (top 3 as Sponsored, others as Trending)
        return sorted.slice(0, 15).map((i, idx) => ({
            ...i,
            isSponsored: idx < 3
        }));
    }, [issues]);

    const DEFAULT_INDEX = Math.min(2, Math.max(0, featuredIssues.length - 1));
    const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
    const [isHovered, setIsHovered] = useState(false);
    const [commentsMap, setCommentsMap] = useState({});
    const timeoutRef = useRef(null);

    // Fetch comments concurrently for all featured issues
    useEffect(() => {
        if (featuredIssues.length > 0) {
            const fetchAllComments = async () => {
                const fetchPromises = featuredIssues.map(async (issue) => {
                    try {
                        const res = await axios.get(`/api/issues/${issue._id}/comments`);
                        return { id: issue._id, data: res.data.data || [] };
                    } catch (e) {
                        return { id: issue._id, data: [] };
                    }
                });
                const results = await Promise.all(fetchPromises);
                const newMap = {};
                results.forEach((res) => {
                    newMap[res.id] = res.data;
                });
                setCommentsMap(newMap);
            };
            fetchAllComments();
        }
    }, [featuredIssues]);

    // Reset auto slide snapback after 8 seconds of inactivity
    useEffect(() => {
        if (isHovered) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        if (activeIndex !== DEFAULT_INDEX) {
            timeoutRef.current = setTimeout(() => {
                setActiveIndex(DEFAULT_INDEX);
            }, 8000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [activeIndex, isHovered, DEFAULT_INDEX]);

    if (!featuredIssues || featuredIssues.length === 0) return null;

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? featuredIssues.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % featuredIssues.length);
    };

    return (
        <div
            className="mb-6 w-full relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Carousel Container */}
            <div className="relative h-[320px] md:h-[350px] w-full flex justify-center items-center overflow-hidden perspective-1000">
                {featuredIssues.map((issue, index) => {
                    let offset = index - activeIndex;
                    const total = featuredIssues.length;

                    if (total > 4) {
                        if (offset < -Math.floor(total / 2)) offset += total;
                        if (offset > Math.floor(total / 2)) offset -= total;
                    }

                    const isCenter = offset === 0;
                    const isLeft1 = offset === -1;
                    const isRight1 = offset === 1;
                    const isLeft2 = offset === -2;
                    const isRight2 = offset === 2;

                    let translateX = 0;
                    let scale = 1;
                    let zIndex = 0;
                    let opacity = 0;

                    if (isCenter) {
                        translateX = 0;
                        scale = 1;
                        zIndex = 30;
                        opacity = 1;
                    } else if (isLeft1) {
                        translateX = -45;
                        scale = 0.85;
                        zIndex = 20;
                        opacity = 0.8;
                    } else if (isRight1) {
                        translateX = 45;
                        scale = 0.85;
                        zIndex = 20;
                        opacity = 0.8;
                    } else if (isLeft2) {
                        translateX = -80;
                        scale = 0.7;
                        zIndex = 10;
                        opacity = 0.4;
                    } else if (isRight2) {
                        translateX = 80;
                        scale = 0.7;
                        zIndex = 10;
                        opacity = 0.4;
                    } else {
                        translateX = offset < 0 ? -120 : 120;
                        scale = 0.5;
                        zIndex = 0;
                        opacity = 0;
                    }

                    const comments = commentsMap[issue._id] || issue.comments || [];

                    return (
                        <div
                            key={issue._id}
                            className="absolute w-[95%] md:w-[85%] lg:w-[70%] transition-all duration-700 ease-out select-none"
                            style={{
                                transform: `translateX(${translateX}%) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                pointerEvents: isCenter ? "auto" : "none",
                                filter: isCenter ? "none" : "blur(3px)"
                            }}
                        >
                            <div className="block bg-bg-secondary hover:bg-bg-secondary/95 border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
                                {/* Split Grid Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[260px] md:h-[280px]">
                                    {/* Left Side: Post Content */}
                                    <div className="flex flex-col justify-between h-full pr-0 md:pr-4 md:border-r border-border/60">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                {issue.isSponsored ? (
                                                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 shadow-sm">
                                                        <Crown size={11} /> Sponsored
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-500/10 text-[#00d68f] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                                                        <Flame size={11} /> Trending
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 bg-bg-elevated px-2.5 py-1 rounded-lg border border-border">
                                                    <DollarSign size={13} className="text-[#f5a623]" />
                                                    <span className="font-extrabold text-[#f5a623] text-sm">{issue.bounty?.amount}</span>
                                                    <span className="text-[10px] text-text-muted font-semibold">{issue.bounty?.currency}</span>
                                                </div>
                                            </div>

                                            <Link to={`/issue/${issue._id}`} className="block group">
                                                <h3 className="font-black text-text-primary group-hover:text-blue-400 transition-colors text-lg md:text-xl leading-snug line-clamp-2 mb-2">
                                                    {issue.title}
                                                </h3>
                                            </Link>

                                            <p className="text-text-secondary text-[13px] leading-relaxed line-clamp-3 mb-4">
                                                {issue.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-[11px] text-text-muted font-bold tracking-wide uppercase">
                                            <span className="flex items-center gap-1 bg-bg-elevated px-2 py-1 rounded border border-border">
                                                <MessageSquare size={12} className="text-blue-400" />
                                                <span>{issue.comments?.length || 0} Comments</span>
                                            </span>
                                            <span className="flex items-center gap-1 bg-bg-elevated px-2 py-1 rounded border border-border">
                                                <Zap size={12} className="text-amber-500" />
                                                <span>{issue.applicationCount || 0} Developers</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Side: Dynamic Discussion comments */}
                                    <div className="flex flex-col h-full pl-0 md:pl-2">
                                        <div className="flex items-center gap-1.5 mb-3 border-b border-border/40 pb-2">
                                            <MessageSquare size={13} className="text-blue-400" />
                                            <span className="text-[12px] font-bold text-text-primary uppercase tracking-wider">
                                                Live Discussion
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00d68f] animate-pulse ml-1" />
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                                            {comments.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-bg-elevated/40 border border-border/40 rounded-xl">
                                                    <span className="text-lg mb-1">🔥</span>
                                                    <p className="text-[12px] font-semibold text-text-primary">
                                                        No discussion comments yet
                                                    </p>
                                                    <p className="text-[11px] text-text-muted mt-0.5">
                                                        Be the first to claim and start the conversation!
                                                    </p>
                                                </div>
                                            ) : (
                                                comments.slice(0, 3).map((comment) => (
                                                    <div
                                                        key={comment._id}
                                                        className="flex gap-2 p-2 bg-bg-elevated/50 border border-border/50 rounded-xl hover:border-border transition-colors shrink-0"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-[#00d68f] flex items-center justify-center text-text-primary text-[10px] font-bold shrink-0 shadow-sm border border-border/20">
                                                            {comment.userId?.name?.[0]?.toUpperCase() || "U"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-bold text-text-primary text-[11px] truncate">
                                                                    {comment.userId?.name || "Anonymous"}
                                                                </span>
                                                                <span className="text-[9px] text-text-muted">
                                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}
                                                                </span>
                                                            </div>
                                                            <p className="text-text-secondary text-[11px] mt-0.5 line-clamp-2 leading-tight">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* View Details Redirect Trigger */}
                                        <div className="mt-3 pt-2 border-t border-border/40 text-right">
                                            <Link
                                                to={`/issue/${issue._id}`}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
                                            >
                                                <span>Join Discussion</span>
                                                <span>&rarr;</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            {featuredIssues.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center px-1 md:px-4 pointer-events-none z-40">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full bg-bg-elevated/90 hover:bg-bg-elevated border border-border text-text-primary flex items-center justify-center hover:text-blue-400 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 shadow-2xl -translate-x-2 group-hover:translate-x-0 cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-10 h-10 rounded-full bg-bg-elevated/90 hover:bg-bg-elevated border border-border text-text-primary flex items-center justify-center hover:text-blue-400 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 shadow-2xl translate-x-2 group-hover:translate-x-0 cursor-pointer"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};
