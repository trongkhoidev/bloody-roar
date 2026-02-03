import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    Briefcase,
    PlusCircle,
    LogOut,
    Wallet,
    FileText,
    Settings,
    Menu,
    X,
    ChevronRight,
    Home,
    Search,
    Zap,
    TrendingUp,
    Command,
    Bell,
    ChevronDown,
    ExternalLink,
    Github,
    Twitter
} from "lucide-react";
import clsx from "clsx";
import ChatWidget from "../components/Chat/ChatWidget";
import NotificationDropdown from "../components/Notifications/NotificationDropdown";
import MessagesDropdown from "../components/Messages/MessagesDropdown";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getNavigationItems = () => {
        const baseItems = [
            { label: "Marketplace", path: "/", icon: <Home size={18} />, desc: "Browse all bounties" },
        ];

        if (user?.role === 'CLIENT') {
            return [
                ...baseItems,
                { label: "Dashboard", path: "/client-dashboard", icon: <LayoutDashboard size={18} />, desc: "Overview & stats" },
                { label: "My Posts", path: "/my-posts", icon: <Briefcase size={18} />, desc: "Manage your jobs" },
                { label: "Post Bounty", path: "/post-job", icon: <PlusCircle size={18} />, desc: "Create new bounty", highlight: true },
            ];
        } else if (user?.role === 'DEVELOPER') {
            return [
                ...baseItems,
                { label: "Applications", path: "/applications", icon: <FileText size={18} />, desc: "Track submissions" },
                { label: "Earnings", path: "/earnings", icon: <Wallet size={18} />, desc: "View payments" },
            ];
        }
        return baseItems;
    };

    const navItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-[#000] flex">
            {/* Sidebar */}
            {user && (
                <aside
                    className={clsx(
                        "fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-[#262626] transition-all duration-300 z-30 flex flex-col",
                        isSidebarOpen ? "w-60" : "w-0 md:w-16"
                    )}
                >
                    {/* Logo */}
                    <div className="h-14 px-4 border-b border-[#262626] flex items-center justify-between">
                        {isSidebarOpen ? (
                            <Link to="/" className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                                    <Zap size={16} className="text-black" />
                                </div>
                                <span className="font-semibold text-[15px] text-white">Bloody Roar</span>
                            </Link>
                        ) : (
                            <Link to="/" className="w-7 h-7 bg-white rounded-md flex items-center justify-center mx-auto">
                                <Zap size={16} className="text-black" />
                            </Link>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={clsx(
                                "p-1.5 hover:bg-[#262626] rounded-md transition-colors text-[#a1a1aa] hover:text-white",
                                !isSidebarOpen && "hidden md:block absolute right-2"
                            )}
                        >
                            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md transition-all group relative",
                                    location.pathname === item.path
                                        ? "bg-[#262626] text-white"
                                        : "text-[#a1a1aa] hover:bg-[#171717] hover:text-white",
                                    item.highlight && "bg-white text-black hover:bg-[#e5e5e5] hover:text-black"
                                )}
                            >
                                <span className={clsx(
                                    "flex-shrink-0",
                                    item.highlight && "text-black"
                                )}>
                                    {item.icon}
                                </span>
                                {isSidebarOpen && (
                                    <span className={clsx(
                                        "text-[13px] font-medium",
                                        item.highlight && "text-black"
                                    )}>
                                        {item.label}
                                    </span>
                                )}
                                {location.pathname === item.path && isSidebarOpen && !item.highlight && (
                                    <ChevronRight size={14} className="ml-auto text-[#71717a]" />
                                )}
                            </Link>
                        ))}

                        {isSidebarOpen && (
                            <div className="pt-4 mt-4 border-t border-[#262626]">
                                <p className="px-3 py-2 text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Resources</p>
                                <a
                                    href="#"
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#a1a1aa] hover:bg-[#171717] hover:text-white transition-all text-[13px]"
                                >
                                    <FileText size={16} />
                                    Documentation
                                    <ExternalLink size={12} className="ml-auto text-[#71717a]" />
                                </a>
                                <Link
                                    to="/profile"
                                    className={clsx(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-md transition-all text-[13px]",
                                        location.pathname === "/profile"
                                            ? "bg-[#262626] text-white"
                                            : "text-[#a1a1aa] hover:bg-[#171717] hover:text-white"
                                    )}
                                >
                                    <Settings size={16} />
                                    Settings
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* User Profile Section */}
                    {isSidebarOpen && (
                        <div className="p-3 border-t border-[#262626]">
                            <div 
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#171717] cursor-pointer transition-colors"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-medium text-sm">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-white truncate">{user.name}</p>
                                    <p className="text-[11px] text-[#71717a] truncate">{user.email}</p>
                                </div>
                                <ChevronDown size={14} className={clsx(
                                    "text-[#71717a] transition-transform",
                                    showUserMenu && "rotate-180"
                                )} />
                            </div>
                            
                            {showUserMenu && (
                                <div className="mt-2 p-1 bg-[#171717] rounded-lg border border-[#262626] animate-slide-down">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-[#262626] rounded-md transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            )}

            {/* Main Content */}
            <div className={clsx(
                "flex-1 flex flex-col transition-all duration-300 min-h-screen",
                user && (isSidebarOpen ? "ml-60" : "ml-0 md:ml-16")
            )}>
                {/* Top Bar */}
                <header className="h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#262626] px-4 sticky top-0 z-20">
                    <div className="h-full flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                        {/* Left side */}
                        <div className="flex items-center gap-4 flex-1">
                            {!user && (
                                <Link to="/" className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                                        <Zap size={16} className="text-black" />
                                    </div>
                                    <span className="font-semibold text-[15px] text-white">Bloody Roar</span>
                                </Link>
                            )}
                            
                            {/* Search Bar */}
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search bounties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-12 py-2 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] transition-all text-[13px]"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-[#262626] rounded border border-[#333] text-[10px] text-[#71717a]">
                                    <Command size={10} />K
                                </div>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {user ? (
                                <>
                                    {/* Quick Stats */}
                                    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-[#171717] rounded-lg border border-[#262626]">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-[#00d68f] animate-pulse" />
                                            <span className="text-[12px] text-[#a1a1aa]">Live</span>
                                        </div>
                                        <div className="w-px h-4 bg-[#262626]" />
                                        <div className="flex items-center gap-1.5">
                                            <TrendingUp size={12} className="text-[#f5a623]" />
                                            <span className="text-[12px] font-medium text-white">42 ETH</span>
                                            <span className="text-[12px] text-[#71717a]">in bounties</span>
                                        </div>
                                    </div>
                                    <NotificationDropdown />
                                    <MessagesDropdown />
                                </>
                            ) : (
                                <>
                                    <nav className="hidden md:flex items-center gap-1">
                                        <a href="#" className="px-3 py-1.5 text-[13px] text-[#a1a1aa] hover:text-white transition-colors">
                                            Features
                                        </a>
                                        <a href="#" className="px-3 py-1.5 text-[13px] text-[#a1a1aa] hover:text-white transition-colors">
                                            Pricing
                                        </a>
                                        <a href="#" className="px-3 py-1.5 text-[13px] text-[#a1a1aa] hover:text-white transition-colors">
                                            Docs
                                        </a>
                                    </nav>
                                    <div className="flex items-center gap-2 ml-2">
                                        <Link
                                            to="/login"
                                            className="px-3 py-1.5 text-[13px] font-medium text-[#a1a1aa] hover:text-white transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="px-3 py-1.5 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#262626] py-8 mt-auto">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <Link to="/" className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                        <Zap size={12} className="text-black" />
                                    </div>
                                    <span className="font-medium text-sm text-white">Bloody Roar</span>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="text-[#71717a] hover:text-white transition-colors">
                                        <Github size={16} />
                                    </a>
                                    <a href="#" className="text-[#71717a] hover:text-white transition-colors">
                                        <Twitter size={16} />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-[13px]">
                                <a href="#" className="text-[#a1a1aa] hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="text-[#a1a1aa] hover:text-white transition-colors">Terms</a>
                                <span className="text-[#71717a]">{new Date().getFullYear()} Bloody Roar</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Global Chat Widget */}
            {user && <ChatWidget />}
        </div>
    );
};

export default MainLayout;
