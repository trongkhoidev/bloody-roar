import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Code, Shield, ArrowRight, Zap, Users, Globe, Sun, Moon } from 'lucide-react';
import axios from 'axios';

const Landing = () => {
 const [stats, setStats] = useState({
 totalIssues: 0,
 totalValue: 0,
 totalDevs: 0,
 completedIssues: 0
 });

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

 useEffect(() => {
 const fetchStats = async () => {
 try {
 const res = await axios.get('http://localhost:3000/api/analytics/stats');
 setStats(res.data);
 } catch (error) {
 console.error("Failed to fetch stats:", error);
 }
 };
 fetchStats();
 }, []);

 return (
 <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden">
 {/* Navbar */}
 <nav className=" backdrop-blur-md fixed top-0 w-full z-50 bg-bg-secondary/50">
 <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Zap className="text-text-primary" size={24} />
 <span className="font-bold text-xl tracking-tight">Bloody Roar <span className="text-text-muted font-normal">Docs</span></span>
 </div>
 <div className="flex items-center gap-6 text-sm font-medium">
 <a href="http://localhost:5173" className="text-text-secondary hover:text-text-primary transition-colors">Go to Platform</a>
 <button
 onClick={toggleTheme}
 className="p-2 bg-bg-elevated hover:bg-bg-elevated rounded-lg transition-all text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer shadow-sm"
 title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
 >
 {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
 </button>
 <Link to="/docs" className="bg-text-primary text-bg-primary px-4 py-2 rounded-full hover:bg-bg-elevated hover:text-text-primary transition-colors">
 Read Docs
 </Link>
 </div>
 </div>
 </nav>

 {/* Hero Section */}
 <div className="relative pt-32 pb-20 px-6">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl -z-10" />

 <div className="max-w-4xl mx-auto text-center space-y-8">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-elevated text-xs font-medium text-purple-300">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
 </span>
 v1.0.0 Now Live
 </div>

 <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent py-2">
 Build the Future of <br /> Decentralized Work.
 </h1>

 <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
 Complete technical documentation for the Bloody Roar bounty marketplace.
 Learn how to integrate, contribute, and earn.
 </p>

 <div className="flex flex-wrap items-center justify-center gap-4">
 <Link to="/docs" className="flex items-center gap-2 bg-text-primary text-bg-primary px-8 py-3.5 rounded-full font-semibold hover:bg-bg-elevated hover:text-text-primary transition-all active:scale-95">
 Get Started <ArrowRight size={18} />
 </Link>
 <a href="http://localhost:5173/post-job" className="flex items-center gap-2 bg-bg-elevated text-text-primary px-8 py-3.5 rounded-full font-semibold hover:bg-bg-secondary transition-all ">
 Post a Bounty
 </a>
 </div>
 </div>
 </div>

 {/* Features Grid */}
 <div className="max-w-7xl mx-auto px-6 py-20 ">
 <div className="grid md:grid-cols-3 gap-8">
 <FeatureCard
 icon={<Book className="text-purple-400" />}
 title="Comprehensive Guides"
 desc="Step-by-step tutorials for Clients to post jobs and Developers to submit work."
 />
 <FeatureCard
 icon={<Code className="text-blue-400" />}
 title="Developer API"
 desc="Deep dive into our smart contract architecture and frontend integration patterns."
 />
 <FeatureCard
 icon={<Shield className="text-green-400" />}
 title="Security First"
 desc="Learn about our escrow guidelines, dispute resolution, and audit reports."
 />
 </div>
 </div>

 {/* Live Stats */}
 <div className="max-w-7xl mx-auto px-6 py-20">
 <div className="rounded-3xl bg-bg-elevated p-12 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50" />
 <div className="relative z-10 grid md:grid-cols-4 gap-8 text-center divide-x divide-">
 <StatItem label="Total Bounties" value={stats.totalIssues} />
 <StatItem label="Total Value Locked" value={`${stats.totalValue} ETH`} />
 <StatItem label="Active Devs" value={stats.totalDevs} />
 <StatItem label="Jobs Completed" value={stats.completedIssues} />
 </div>
 </div>
 </div>

 {/* Footer */}
 <footer className=" py-12 text-center text-text-muted text-sm">
 <p>&copy; {new Date().getFullYear()} Bloody Roar Platform. Documentation.</p>
 </footer>
 </div>
 );
};

const FeatureCard = ({ icon, title, desc }) => (
 <div className="p-6 rounded-2xl bg-bg-elevated hover:bg-bg-elevated transition-colors group">
 <div className="mb-4 p-3 bg-bg-primary rounded-lg w-fit group-hover:scale-110 transition-transform">{icon}</div>
 <h3 className="text-xl font-semibold mb-2">{title}</h3>
 <p className="text-text-secondary leading-relaxed">{desc}</p>
 </div>
);

const StatItem = ({ label, value }) => (
 <div className="px-4">
 <div className="text-4xl font-bold text-text-primary mb-1">{value}</div>
 <div className="text-sm font-medium text-text-muted uppercase tracking-widest">{label}</div>
 </div>
);

export default Landing;
