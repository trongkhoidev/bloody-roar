import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@app/context/AuthContext";
import { useWallet } from "@app/context/WalletContext";
import axios from "axios";
import {
    PlusCircle,
    Search,
    Bell,
    ChevronDown,
    ChevronUp,
    Wallet,
    Award,
    History,
    X,
    TrendingUp,
    DollarSign,
    Clock,
    Code,
    Globe,
    Cpu,
    Sparkles,
    Smartphone,
    Gamepad2
} from "lucide-react";
import clsx from "clsx";
import ChatWidget from "@features/chat/ChatWidget";
import NotificationDropdown from "@entities/notification/NotificationDropdown";
import MessagesDropdown from "@features/chat/MessagesDropdown";
import HeaderDropdown from "@widgets/HeaderDropdown";
import { IssueCategory } from "@bloody-roar/shared-types";

const MainLayout = () => {
    const { user } = useAuth();
    const { isConnected, account, balance, shortenAddress } = useWallet();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem("recentSearches");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const searchContainerRef = useRef(null);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.setAttribute("data-theme", "light");
        } else {
            root.removeAttribute("data-theme");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Auto-complete Debounced Search for real-time results dropdown
    useEffect(() => {
        if (!searchInput.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await axios.get(`/api/issues?q=${encodeURIComponent(searchInput.trim())}`);
                setSearchResults((res.data.data || []).slice(0, 5));
            } catch (error) {
                console.error("Autocomplete search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput]);

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update search param on submit or enter
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchInput.trim();
        if (trimmed) {
            const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem("recentSearches", JSON.stringify(updated));
        }

        const newParams = new URLSearchParams(searchParams);
        if (trimmed) {
            newParams.set("q", trimmed);
        } else {
            newParams.delete("q");
        }
        setIsSearchFocused(false);

        // Force navigate to home marketplace if we are searching and currently on another page
        if (location.pathname !== "/") {
            navigate(`/?${newParams.toString()}`);
        } else {
            setSearchParams(newParams);
        }
    };

    const handleRecentSearchClick = (searchKey) => {
        setSearchInput(searchKey);
        const updated = [searchKey, ...recentSearches.filter(s => s !== searchKey)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));

        const newParams = new URLSearchParams(searchParams);
        newParams.set("q", searchKey);
        setIsSearchFocused(false);

        if (location.pathname !== "/") {
            navigate(`/?${newParams.toString()}`);
        } else {
            setSearchParams(newParams);
        }
    };

    const handleRecentSearchDelete = (e, searchKey) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== searchKey);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const handleSelectParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        const currentVal = newParams.get(key);

        if (currentVal === value || !value) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setIsSearchFocused(false);

        if (location.pathname !== "/") {
            navigate(`/?${newParams.toString()}`);
        } else {
            setSearchParams(newParams);
        }
    };

    const activeSort = searchParams.get("sort") || "";
    const activeCategory = searchParams.get("category") || "";
    const activeTech = searchParams.get("tech") || "";

    const sortOptions = [
        { label: "Trending 🔥", value: "trending", icon: <TrendingUp size={13} className="text-red-400" /> },
        { label: "Highest Reward 💰", value: "highest_reward", icon: <DollarSign size={13} className="text-emerald-400" /> },
        { label: "Newest first ⏰", value: "newest", icon: <Clock size={13} className="text-blue-400" /> },
    ];

    const techOptions = ["React", "Node", "Python", "Solidity", "Rust", "TypeScript"];

    const categoryOptions = [
        { label: "All Categories 🗂️", value: "", icon: <Code size={13} className="text-gray-400" /> },
        { label: "Web Dev 🌐", value: IssueCategory.WEB, icon: <Globe size={13} className="text-blue-400" /> },
        { label: "Blockchain ⛓️", value: IssueCategory.BLOCKCHAIN, icon: <Cpu size={13} className="text-emerald-400" /> },
        { label: "AI / ML 🧠", value: IssueCategory.AI, icon: <Sparkles size={13} className="text-purple-400" /> },
        { label: "Mobile Apps 📱", value: IssueCategory.MOBILE, icon: <Smartphone size={13} className="text-pink-400" /> },
        { label: "Game Dev 🎮", value: IssueCategory.GAME, icon: <Gamepad2 size={13} className="text-amber-400" /> }
    ];

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            {/* Header - Styled like Polymarket DNA */}
            <header className="h-16 bg-bg-header backdrop-blur-xl border-b border-border sticky top-0 z-40">
                <div className="h-full max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-4">
                    {/* Left Side: Logo & Universal Search */}
                    <div className="flex items-center gap-4 flex-1 max-w-3xl xl:max-w-4xl">
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                            <img src="/image/logo.png" alt="Bloody Roar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                            <span className="font-bold text-[16px] text-text-primary tracking-tight">Bloody Roar</span>
                        </Link>

                        {/* Search Bar Container - Sleek and Expanded Width */}
                        <div ref={searchContainerRef} className="relative hidden lg:block flex-1 max-w-xl xl:max-w-2xl ml-2">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by title, description or category..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="w-full pl-9 pr-8 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-border-hover/30 transition-all text-[12px]"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full hover:bg-bg-primary/50 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </form>

                            {/* Autocomplete Dropdown - Vercel Glassmorphism Style */}
                            {isSearchFocused && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-bg-header/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Empty Search input state: Show history & categories */}
                                    {!searchInput.trim() ? (
                                        <div className="p-4 space-y-4">
                                            {/* Recent Searches */}
                                            {recentSearches.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recent Searches</h4>
                                                    <div className="flex flex-col gap-1">
                                                        {recentSearches.map((key) => (
                                                            <div
                                                                key={key}
                                                                onClick={() => handleRecentSearchClick(key)}
                                                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-bg-elevated/80 text-[12px] text-text-secondary hover:text-text-primary transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <History size={13} className="text-text-muted group-hover:text-text-primary" />
                                                                    <span>{key}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => handleRecentSearchDelete(e, key)}
                                                                    className="text-text-muted hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                                    title="Delete history"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                                                {/* Left Side: Sort & Popular Tech */}
                                                <div className="space-y-4">
                                                    {/* Quick Sort */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Quick Sort</h4>
                                                        <div className="flex flex-col gap-1">
                                                            {sortOptions.map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => handleSelectParam("sort", opt.value)}
                                                                    className={clsx(
                                                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer text-left w-full hover:bg-bg-elevated/80 text-text-secondary hover:text-text-primary",
                                                                        activeSort === opt.value && "bg-bg-elevated/80 text-text-primary font-bold border border-border/40"
                                                                    )}
                                                                >
                                                                    {opt.icon}
                                                                    <span>{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tech Stack Filters */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tech Stack</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {techOptions.map((tech) => (
                                                                <button
                                                                    key={tech}
                                                                    onClick={() => handleSelectParam("tech", tech)}
                                                                    className={clsx(
                                                                        "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer",
                                                                        activeTech === tech
                                                                            ? "bg-bg-elevated border-amber-500 text-text-primary shadow-sm"
                                                                            : "bg-bg-elevated border-border text-text-secondary hover:border-border-hover"
                                                                    )}
                                                                >
                                                                    {tech}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Side: Bounty Categories */}
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Bounty Categories</h4>
                                                    <div className="flex flex-col gap-1">
                                                        {categoryOptions.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => handleSelectParam("category", opt.value)}
                                                                className={clsx(
                                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer text-left w-full hover:bg-bg-elevated/80 text-text-secondary hover:text-text-primary",
                                                                    activeCategory === opt.value && "bg-bg-elevated/80 text-text-primary font-bold border border-border/40"
                                                                )}
                                                            >
                                                                {opt.icon}
                                                                <span>{opt.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Typing State: Show Auto-complete Results */
                                        <div className="p-2 space-y-1">
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                {isSearching ? "Searching issues..." : "Matched Issues"}
                                            </div>

                                            {isSearching ? (
                                                <div className="py-8 text-center text-[12px] text-text-muted animate-pulse">
                                                    Fetching matching bounties...
                                                </div>
                                            ) : searchResults.length === 0 ? (
                                                <div className="py-8 text-center text-[12px] text-text-muted">
                                                    No bounties matched "{searchInput}"
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {searchResults.map((issue) => (
                                                        <Link
                                                            key={issue._id}
                                                            to={`/issue/${issue._id}`}
                                                            onClick={() => {
                                                                setIsSearchFocused(false);
                                                                const updated = [searchInput.trim(), ...recentSearches.filter(s => s !== searchInput.trim())].slice(0, 5);
                                                                setRecentSearches(updated);
                                                                localStorage.setItem("recentSearches", JSON.stringify(updated));
                                                            }}
                                                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-elevated/80 border border-transparent hover:border-border/30 transition-all group"
                                                        >
                                                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                                                                <span className="text-[12px] font-bold text-text-primary truncate group-hover:text-white transition-colors">{issue.title}</span>
                                                                <span className="text-[10px] text-text-muted capitalize">{issue.category} • {issue.githubRepoUrl.split('/').pop()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                                <span className="text-[11px] font-bold text-[#00d68f]">{issue.bounty?.amount} ETH</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spacer eliminated to allow search container to fully expand */}

                    {/* Right Side: Wallet & Actions */}
                    <div className="flex items-center gap-3">

                        {user ? (
                            <>
                                {/* Web3 Connected Wallet Mini Widget & Balance */}
                                {isConnected && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg-elevated/60 border border-border rounded-lg text-text-secondary text-[12px] font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00d68f] animate-pulse" />
                                        <span className="font-mono text-text-muted text-[11px]">{shortenAddress(account)}</span>
                                        <span className="w-px h-3.5 bg-border mx-1" />
                                        <span className="text-[#f5a623]">{parseFloat(balance || 0).toFixed(4)} ETH</span>
                                    </div>
                                )}

                                {/* Create Bounty Link */}
                                <Link
                                    to="/post-job"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-text-primary text-bg-primary hover:bg-white/90 text-[12px] font-bold rounded-lg shadow-sm transition-all"
                                >
                                    <PlusCircle size={14} />
                                    <span className="hidden sm:inline">Post Bounty</span>
                                </Link>

                                {/* Dropdowns */}
                                <MessagesDropdown />
                                <NotificationDropdown />

                                {/* Avatar & Trigger with Flipped chevron toggle indicator */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(!isProfileOpen);
                                        }}
                                        className="flex items-center gap-1.5 p-1 bg-bg-elevated hover:bg-bg-elevated/80 border border-border rounded-full transition-all cursor-pointer"
                                    >
                                        <div className="w-7 h-7 bg-gradient-to-br from-[#3b82f6] to-[#00d68f] rounded-full flex items-center justify-center text-text-primary font-semibold text-xs border border-border/40">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        {isProfileOpen ? (
                                            <ChevronUp size={12} className="text-text-muted mr-1 transition-all duration-200" />
                                        ) : (
                                            <ChevronDown size={12} className="text-text-muted mr-1 transition-all duration-200" />
                                        )}
                                    </button>
                                    <HeaderDropdown
                                        isOpen={isProfileOpen}
                                        onClose={() => setIsProfileOpen(false)}
                                        theme={theme}
                                        toggleTheme={toggleTheme}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3.5 py-1.5 text-[12px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-3.5 py-1.5 bg-white text-black text-[12px] font-bold rounded-lg hover:bg-neutral-200 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>


            {/* Content Body (Zero Left Offset) */}
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-[1400px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Chat Overlay for Support & Users */}
            {user && <ChatWidget />}
        </div>
    );
};

export default MainLayout;
