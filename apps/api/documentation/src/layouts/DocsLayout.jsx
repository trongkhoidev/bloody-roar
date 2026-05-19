import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
 Book,
 Menu,
 X,
 ChevronRight,
 Briefcase,
 Code,
 Shield,
 Search,
 Zap,
 HelpCircle,
 FileText,
 Sun,
 Moon
} from 'lucide-react';
import clsx from 'clsx';

const DocsLayout = () => {
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const location = useLocation();

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


 const navItems = [
 {
 section: 'Getting Started',
 items: [
 { label: 'Introduction', path: '/docs', icon: <Book size={16} /> },
 { label: 'Platform Overview', path: '/docs/overview', icon: <Zap size={16} /> },
 ]
 },
 {
 section: 'Architecture & Trust',
 items: [
 { label: 'Dual-Deposit Escrow', path: '/docs/architecture/escrow', icon: <Briefcase size={16} /> },
 { label: 'eKYC & Identity (SBTs)', path: '/docs/architecture/ekyc', icon: <Shield size={16} /> },
 { label: 'Sandbox Execution', path: '/docs/architecture/sandbox', icon: <Code size={16} /> },
 { label: 'AI Dispute Assistant', path: '/docs/architecture/ai-dispute', icon: <Zap size={16} /> },
 ]
 },
 {
 section: 'Guides',
 items: [
 { label: 'For Clients', path: '/docs/clients-guide', icon: <Briefcase size={16} /> },
 { label: 'For Developers', path: '/docs/developers-guide', icon: <Code size={16} /> },
 { label: 'Platform Rules', path: '/docs/rules', icon: <Shield size={16} /> },
 ]
 },
 {
 section: 'Support',
 items: [
 { label: 'FAQ', path: '/docs/faq', icon: <HelpCircle size={16} /> },
 { label: 'Contact Support', path: '/docs/contact', icon: <FileText size={16} /> },
 ]
 }
 ];

 return (
 <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
 {/* Top Navigation */}
 <header className="h-16 flex items-center justify-between px-6 sticky top-0 bg-bg-header backdrop-blur-xl z-20">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="p-2 hover:bg-bg-elevated rounded-lg lg:hidden"
 >
 <Menu size={20} />
 </button>
 <Link to="/" className="flex items-center gap-2 font-bold text-lg">
 <img src="/image/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
 Bloody Roar <span className="text-text-muted text-sm font-normal">Docs</span>
 </Link>
 </div>

 <div className="flex-1 max-w-xl mx-4 hidden md:block">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
 <input
 type="text"
 placeholder="Search documentation..."
 className="w-full bg-bg-elevated rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus: transition-all placeholder-white/20"
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted px-1.5 rounded">⌘K</div>
 </div>
 </div>

 <div className="flex items-center gap-4 text-sm font-medium">
 <a href="http://localhost:5173" className="hidden md:block text-text-secondary hover:text-text-primary transition-colors">Platform</a>
 <a href="#" className="hidden md:block text-text-secondary hover:text-text-primary transition-colors">GitHub</a>
 <button
 onClick={toggleTheme}
 className="p-2 bg-bg-elevated hover:bg-bg-elevated rounded-lg transition-all text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer shadow-sm ml-1"
 title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
 >
 {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
 </button>
 </div>
 </header>

 <div className="flex flex-1 overflow-hidden">
 {/* Sidebar */}
 <aside className={clsx(
 "fixed lg:static inset-y-0 left-0 z-10 w-72 bg-bg-secondary pt-6 pb-10 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 mt-16 lg:mt-0",
 !isSidebarOpen && "-translate-x-full"
 )}>
 <div className="px-4 space-y-8">
 {navItems.map((group, idx) => (
 <div key={idx}>
 <h3 className="px-3 mb-2 text-xs font-bold text-text-muted uppercase tracking-wider">{group.section}</h3>
 <div className="space-y-0.5">
 {group.items.map((item) => (
 <Link
 key={item.path}
 to={item.path}
 className={clsx(
 "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
 location.pathname === item.path
 ? "bg-text-primary text-bg-primary font-medium"
 : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
 )}
 >
 <span className={clsx(!location.pathname === item.path && "text-text-muted group-hover:text-text-primary")}>{item.icon}</span>
 {item.label}
 {location.pathname === item.path && <ChevronRight size={14} className="ml-auto opacity-50" />}
 </Link>
 ))}
 </div>
 </div>
 ))}
 </div>
 </aside>

 {/* Main Content Area */}
 <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
 <div className="max-w-4xl mx-auto min-h-screen">
 <Outlet />
 </div>

 <footer className="max-w-4xl mx-auto py-10 mt-20 text-text-muted text-sm flex justify-between">
 <div>Last updated: Today</div>
 <div>&copy; Bloody Roar</div>
 </footer>
 </main>
 </div>
 </div>
 );
};

export default DocsLayout;
