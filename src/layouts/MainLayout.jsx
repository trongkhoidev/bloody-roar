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
    TrendingUp
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

    const getNavigationItems = () => {
        const baseItems = [
            { label: "Marketplace", path: "/", icon: <Home size={20} />, desc: "Browse bounties" },
        ];

        if (user?.role === 'CLIENT') {
            return [
                ...baseItems,
                { label: "Dashboard", path: "/client-dashboard", icon: <LayoutDashboard size={20} />, desc: "Overview & stats" },
                { label: "My Posts", path: "/my-posts", icon: <Briefcase size={20} />, desc: "Manage jobs" },
                { label: "Post Bounty", path: "/post-job", icon: <PlusCircle size={20} />, desc: "Create new", highlight: true },
            ];
        } else if (user?.role === 'DEVELOPER') {
            return [
                ...baseItems,
                { label: "Applications", path: "/applications", icon: <FileText size={20} />, desc: "Track submissions" },
                { label: "Earnings", path: "/earnings", icon: <Wallet size={20} />, desc: "View payments" },
            ];
        }
        return baseItems;
    };

    const navItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-[#0f172a] flex">
            {/* Sidebar */}
            {user && (
                <aside
                    className={clsx(
                        "fixed left-0 top-0 h-full bg-[#1e293b] border-r border-[#334155] transition-all duration-300 z-30 flex flex-col",
                        isSidebarOpen ? "w-64" : "w-0 md:w-20"
                    )}
                >
                    {/* Logo */}
                    <div className="p-4 border-b border-[#334155] flex items-center justify-between">
                        {isSidebarOpen && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">
                                        Bloody Roar
                                    </h1>
                                    <p className="text-xs text-slate-400">Web3 Bounties</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                                    location.pathname === item.path
                                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                        : "text-slate-400 hover:bg-[#334155] hover:text-white",
                                    item.highlight && "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                                )}
                            >
                                <span className={clsx(
                                    "flex-shrink-0",
                                    item.highlight && "text-white",
                                    location.pathname === item.path && !item.highlight && "text-indigo-400"
                                )}>
                                    {item.icon}
                                </span>
                                {isSidebarOpen && (
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx(
                                            "text-sm font-medium truncate",
                                            item.highlight && "text-white"
                                        )}>
                                            {item.label}
                                        </p>
                                        {item.desc && (
                                            <p className={clsx(
                                                "text-xs truncate",
                                                item.highlight ? "text-white/70" : "text-slate-500"
                                            )}>
                                                {item.desc}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {location.pathname === item.path && isSidebarOpen && !item.highlight && (
                                    <ChevronRight size={16} className="text-indigo-400" />
                                )}
                            </Link>
                        ))}

                        <div className="pt-4 mt-4 border-t border-[#334155]">
                            <Link
                                to="/profile"
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                                    location.pathname === "/profile"
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : "text-slate-400 hover:bg-[#334155] hover:text-white"
                                )}
                            >
                                <Settings size={20} />
                                {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
                            </Link>
                        </div>
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 border-t border-[#334155]">
                        {isSidebarOpen ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#334155]/50">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={logout}
                                className="w-full p-2 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className={clsx(
                "flex-1 flex flex-col transition-all duration-300 min-h-screen",
                user && (isSidebarOpen ? "ml-64" : "ml-0 md:ml-20")
            )}>
                {/* Top Bar */}
                <header className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left side - Logo for non-logged users or Search */}
                        <div className="flex items-center gap-4 flex-1">
                            {!user && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white">
                                            Bloody Roar
                                        </h1>
                                        <p className="text-xs text-slate-400">Web3 Bounties</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Search Bar */}
                            {user && (
                                <div className="relative max-w-md flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search bounties..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {/* Quick Stats */}
                                    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#334155] rounded-xl border border-[#475569]">
                                        <TrendingUp size={16} className="text-emerald-400" />
                                        <span className="text-xs text-slate-400">Total Bounties:</span>
                                        <span className="text-sm font-bold text-white">42 ETH</span>
                                    </div>
                                    <NotificationDropdown />
                                    <MessagesDropdown />
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-colors text-sm"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-[#1e293b] border-t border-[#334155] py-6">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-400 text-sm">
                            {new Date().getFullYear()} Bloody Roar. Built on Ethereum.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Documentation</a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Support</a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms</a>
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
