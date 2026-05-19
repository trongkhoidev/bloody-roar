import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@app/context/AuthContext";
import { useWallet } from "@app/context/WalletContext";
import {
    LayoutDashboard,
    User,
    FileText,
    LogOut,
    ExternalLink,
    Sun,
    Moon,
    Wallet,
    TrendingUp,
    ChevronRight,
    Award
} from "lucide-react";


const HeaderDropdown = ({ isOpen, onClose, theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const { connectWallet, isConnected, account, balance, shortenAddress, disconnectWallet } = useWallet();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-72 bg-bg-secondary border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-down"
        >
            {/* User Profile Header */}
            <div className="p-4 border-b border-border bg-bg-elevated/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#00d68f] rounded-full flex items-center justify-center text-text-primary font-semibold text-base shadow-sm">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text-primary truncate">{user.name}</p>
                        <p className="text-[12px] text-text-secondary truncate">{user.email}</p>
                    </div>
                </div>

                {/* Reputation / Stats Badge */}
                <div className="mt-3 flex items-center justify-between bg-bg-elevated/60 px-3 py-1.5 rounded-lg border border-border">
                    <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-[#f5a623]" />
                        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Reputation</span>
                    </div>
                    <span className="text-[13px] font-bold text-text-primary">{user.reputation ?? 0} RP</span>
                </div>
            </div>

            {/* Main Links */}
            <div className="p-1.5 border-b border-border space-y-0.5">
                <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium group"
                >
                    <LayoutDashboard size={15} className="group-hover:text-text-primary transition-colors" />
                    <span>My Dashboard</span>
                    <ChevronRight size={12} className="ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium group"
                >
                    <User size={15} className="group-hover:text-text-primary transition-colors" />
                    <span>Profile Settings</span>
                    <ChevronRight size={12} className="ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <a
                    href="http://localhost:5174"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium group"
                >
                    <FileText size={15} />
                    <span>Documentation</span>
                    <ExternalLink size={11} className="ml-auto text-text-muted" />
                </a>
            </div>

            {/* Utility Toggles (Theme) */}
            <div className="p-1.5 border-b border-border">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                    <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded border border-border uppercase">
                        Theme
                    </span>
                </button>
            </div>

            {/* Wallet Connector Integration */}
            <div className="p-1.5 border-b border-border">
                {isConnected ? (
                    <button
                        onClick={disconnectWallet}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium cursor-pointer"
                    >
                        <Wallet size={15} />
                        <span>Disconnect Wallet</span>
                    </button>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-[13px] font-medium cursor-pointer"
                    >
                        <Wallet size={15} />
                        <span>Connect Wallet</span>
                    </button>
                )}
            </div>

            {/* Log Out */}
            <div className="p-1.5 bg-bg-elevated/40">
                <button
                    onClick={() => {
                        onClose();
                        logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-[13px] font-semibold cursor-pointer"
                >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default HeaderDropdown;
