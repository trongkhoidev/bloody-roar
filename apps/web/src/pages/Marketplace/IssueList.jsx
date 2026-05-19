import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import {
    Code, Search, DollarSign, Clock, Eye, Send, Users,
    Sparkles, TrendingUp, ChevronDown, Zap, ArrowRight,
    Globe, Cpu, Smartphone, Gamepad2, LayoutGrid, List, Award
} from "lucide-react";
import Loader from "@shared/ui/Loader";
import { IssueCard } from "@entities/issue/ui/IssueCard";
import { IssueBanners } from "./IssueBanners";
import { IssueStatus, IssueCategory } from "@bloody-roar/shared-types";

const IssueList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const tech = searchParams.get("tech") || "";
    const searchQuery = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "newest";

    const topics = [
        { label: "All Bounties", value: "" },
        { label: "Web Dev", value: IssueCategory.WEB },
        { label: "Blockchain", value: IssueCategory.BLOCKCHAIN },
        { label: "AI / ML", value: IssueCategory.AI },
        { label: "Mobile Apps", value: IssueCategory.MOBILE },
        { label: "Game Dev", value: IssueCategory.GAME }
    ];

    const handleTopicClick = (catVal) => {
        const newParams = new URLSearchParams(searchParams);
        if (catVal) {
            newParams.set("category", catVal);
        } else {
            newParams.delete("category");
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (category) params.append("category", category);
                if (status) params.append("status", status);
                if (tech) params.append("tech", tech);
                if (searchQuery) params.append("q", searchQuery);

                const res = await axios.get(`/api/issues?${params.toString()}`);
                let fetchedIssues = res.data.data || [];

                // Client-side Sorting to support highly premium filter interaction
                if (sort === "trending") {
                    // Sort by viewCount or application count if available
                    fetchedIssues.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
                } else if (sort === "highest_reward") {
                    fetchedIssues.sort((a, b) => (b.bounty?.amount || 0) - (a.bounty?.amount || 0));
                } else {
                    // Default newest
                    fetchedIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }

                setIssues(fetchedIssues);
            } catch (error) {
                console.error("Error fetching issues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [category, status, tech, searchQuery, sort]);

    if (loading) return <Loader text="Searching marketplace bounties..." />;

    return (
        <div className="space-y-8 animate-fade-in w-full">
            {/* Banners Section */}
            {!loading && issues.length > 0 && <IssueBanners issues={issues} />}

            {/* Sleek Category Filter Buttons/Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border">
                {topics.map((t) => {
                    const isActive = category === t.value;
                    return (
                        <button
                            key={t.value}
                            onClick={() => handleTopicClick(t.value)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer",
                                isActive
                                    ? "bg-text-primary text-bg-primary shadow-sm"
                                    : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border"
                            )}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Filter Info Header (if filter is active) */}
            {(category || status || tech || searchQuery) && (
                <div className="flex items-center gap-2 text-text-secondary text-[13px]">
                    <span>Active filters:</span>
                    {category && <span className="bg-bg-elevated px-2 py-0.5 rounded border border-border text-[11px] font-semibold text-text-primary uppercase">{category}</span>}
                    {status && <span className="bg-bg-elevated px-2 py-0.5 rounded border border-border text-[11px] font-semibold text-text-primary uppercase">{status}</span>}
                    {tech && <span className="bg-bg-elevated px-2 py-0.5 rounded border border-border text-[11px] font-semibold text-text-primary">{tech}</span>}
                    {searchQuery && <span className="bg-bg-elevated px-2 py-0.5 rounded border border-border text-[11px] font-semibold text-text-primary">"{searchQuery}"</span>}
                </div>
            )}

            {/* Issue Grid/List - 1 post per row */}
            {issues.length === 0 ? (
                <div className="text-center py-20 bg-bg-secondary/40 border border-border rounded-xl">
                    <div className="w-14 h-14 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                        <Search size={22} className="text-text-muted" />
                    </div>
                    <p className="text-text-primary text-base font-semibold">No issues matched your search</p>
                    <p className="text-text-secondary text-sm mt-1">Try resetting the dropdown filters or typing a different query</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full max-w-[900px] mx-auto">
                    {issues.map((issue, index) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IssueList;
