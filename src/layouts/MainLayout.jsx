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
    BarChart3,
    Settings,
    MessageSquare,
    Bell,
    Menu,
    X,
    ChevronRight,
    Home
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
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Define navigation based on role
    const getNavigationItems = () => {
        const baseItems = [
            { label: "Marketplace", path: "/", icon: <Home size={20} />, desc: "Browse all jobs" },
        ];

        if (user?.role === 'CLIENT') {
            return [
                ...baseItems,
                { label: "My Dashboard", path: "/client-dashboard", icon: <LayoutDashboard size={20} />, desc: "Overview & stats" },
                { label: "My Posts", path: "/my-posts", icon: <Briefcase size={20} />, desc: "Manage your jobs" },
                { label: "Post Job", path: "/post-job", icon: <PlusCircle size={20} />, desc: "Create new bounty", highlight: true },
            ];
        } else if (user?.role === 'DEVELOPER') {
            return [
                ...baseItems,
                { label: "My Applications", path: "/applications", icon: <FileText size={20} />, desc: "Track submissions" },
                { label: "Earnings", path: "/earnings", icon: <Wallet size={20} />, desc: "View payments" },
            ];
        }
        return baseItems;
    };

    const navItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            {user && (
                <aside
                    className={clsx(
                        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30",
                        isSidebarOpen ? "w-64" : "w-0 md:w-20"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            {isSidebarOpen && (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        BR
                                    </div>
                                    <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                                        Bloody Roar
                                    </h1>
                                </div>
                            )}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                                        location.pathname === item.path
                                            ? "bg-red-50 text-red-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        item.highlight && "bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg"
                                    )}
                                >
                                    <span className={clsx(item.highlight && "text-white")}>
                                        {item.icon}
                                    </span>
                                    {isSidebarOpen && (
                                        <div className="flex-1">
                                            <p className={clsx("text-sm font-medium", item.highlight && "text-white")}>
                                                {item.label}
                                            </p>
                                            {item.desc && (
                                                <p className={clsx("text-xs", item.highlight ? "text-white/80" : "text-gray-400")}>
                                                    {item.desc}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {location.pathname === item.path && isSidebarOpen && (
                                        <ChevronRight size={16} />
                                    )}
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                                >
                                    <Settings size={20} />
                                    {isSidebarOpen && <span className="text-sm">Settings</span>}
                                </Link>
                            </div>
                        </nav>

                        {/* User Profile Section */}
                        <div className="p-4 border-t border-gray-200">
                            {isSidebarOpen ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={logout}
                                    className="w-full p-2 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className={clsx("flex-1 flex flex-col transition-all duration-300", user && (isSidebarOpen ? "ml-64" : "ml-0 md:ml-20"))}>
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {!user && (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        BR
                                    </div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                                        Bloody Roar
                                    </h1>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <NotificationDropdown />
                                    <MessagesDropdown />
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
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
                <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
                    <div className="max-w-7xl mx-auto px-6">
                        <p>&copy; {new Date().getFullYear()} Bloody Roar Platform. Built on Ethereum.</p>
                    </div>
                </footer>
            </div>

            {/* Global Chat Widget */}
            {user && <ChatWidget />}
        </div>
    );
};

export default MainLayout;
