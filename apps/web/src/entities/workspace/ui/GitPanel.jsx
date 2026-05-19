import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    GitBranch, GitCommit, GitPullRequest, ExternalLink, RefreshCw,
    AlertCircle, Star, GitFork, Circle, CheckCircle, XCircle,
    ChevronRight, Clock, User, Tag, MessageSquare, Loader2,
    Lock, Unlock, Zap, FileCode
} from 'lucide-react';

const GitPanel = ({ issueId, isLite = false }) => {
    const [activeTab, setActiveTab] = useState('issues');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const token = localStorage.getItem('token');

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!issueId) return;
        if (isRefresh) setRefreshing(true); else setLoading(true);
        setError('');
        try {
            const { data: res } = await axios.get(
                `${import.meta.env.VITE_API_URL}/github/repo-data/${issueId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load GitHub data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [issueId, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const tabs = [
        { id: 'issues', label: 'Issues', count: data?.issues?.length },
        { id: 'prs', label: 'Pull Requests', count: data?.pullRequests?.length },
        { id: 'commits', label: 'Commits', count: data?.commits?.length },
        { id: 'branches', label: 'Branches', count: data?.branches?.length },
    ];

    const stateBadge = (state, merged, draft) => {
        if (merged) return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400"><GitPullRequest size={10} /> Merged</span>;
        if (draft) return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/20 text-slate-400"><Circle size={10} /> Draft</span>;
        if (state === 'open') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400"><Circle size={10} fill="currentColor" /> Open</span>;
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400"><XCircle size={10} /> Closed</span>;
    };

    const timeAgo = (date) => {
        const d = new Date(date);
        const diff = Math.floor((Date.now() - d) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 py-12">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
            <p className="text-xs">Loading GitHub data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-4">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-red-400 text-center">{error}</p>
            <button onClick={() => fetchData()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-text-primary text-xs rounded-lg transition">
                Try Again
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#0b0f1a] overflow-hidden text-slate-300">

            {/* Repo Header */}
            {data?.repo && (
                <div className="px-4 py-3 bg-[#111827] border-b border-[#1e293b] flex-shrink-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <a href={data.repo.url} target="_blank" rel="noopener noreferrer"
                                    className="text-sm font-bold text-text-primary hover:underline truncate flex items-center gap-1">
                                    {data.repo.fullName}
                                    <ExternalLink size={11} className="flex-shrink-0 text-slate-500" />
                                </a>
                                {data.repo.private
                                    ? <Lock size={11} className="text-amber-400 flex-shrink-0" title="Private" />
                                    : <Unlock size={11} className="text-green-400 flex-shrink-0" title="Public" />}
                            </div>
                            {data.repo.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{data.repo.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5">
                                {data.repo.language && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                                        {data.repo.language}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Star size={10} /> {data.repo.stars}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <GitFork size={10} /> {data.repo.forks}
                                </span>
                                <span className="text-[10px] text-slate-600">
                                    Default: <span className="text-slate-400 font-mono">{data.repo.defaultBranch}</span>
                                </span>
                            </div>
                        </div>
                        <button onClick={() => fetchData(true)} disabled={refreshing}
                            className="p-1.5 text-slate-500 hover:text-text-primary hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                            title="Refresh">
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-[#111827] border-b border-[#1e293b] flex-shrink-0 overflow-x-auto">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 text-[11px] font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${activeTab === tab.id
                            ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5'
                            : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                        {tab.label}
                        {tab.count != null && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">

                {/* Issues Tab */}
                {activeTab === 'issues' && (
                    <>
                        {data?.issues?.length === 0 && (
                            <div className="text-center text-slate-600 py-8 text-sm">No issues found</div>
                        )}
                        {data?.issues?.map(issue => (
                            <a key={issue.number} href={issue.url} target="_blank" rel="noopener noreferrer"
                                className="block bg-[#111827] hover:bg-[#1a2235] border border-[#1e293b] rounded-xl p-3 transition-all group">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {stateBadge(issue.state)}
                                            <span className="text-[10px] text-slate-600 font-mono">#{issue.number}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-200 group-hover:text-text-primary leading-relaxed">{issue.title}</p>
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <User size={9} /> {issue.user?.login}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Clock size={9} /> {timeAgo(issue.createdAt)}
                                            </span>
                                            {issue.comments > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <MessageSquare size={9} /> {issue.comments}
                                                </span>
                                            )}
                                            {issue.labels?.map(label => (
                                                <span key={label.name}
                                                    className="px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                                                    style={{ backgroundColor: `#${label.color}22`, color: `#${label.color}`, border: `1px solid #${label.color}44` }}>
                                                    {label.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition" />
                                </div>
                            </a>
                        ))}
                    </>
                )}

                {/* Pull Requests Tab */}
                {activeTab === 'prs' && (
                    <>
                        {data?.pullRequests?.length === 0 && (
                            <div className="text-center text-slate-600 py-8 text-sm">No pull requests found</div>
                        )}
                        {data?.pullRequests?.map(pr => (
                            <a key={pr.number} href={pr.url} target="_blank" rel="noopener noreferrer"
                                className="block bg-[#111827] hover:bg-[#1a2235] border border-[#1e293b] rounded-xl p-3 transition-all group">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {stateBadge(pr.state, pr.merged, pr.draft)}
                                            <span className="text-[10px] text-slate-600 font-mono">#{pr.number}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-200 group-hover:text-text-primary leading-relaxed">{pr.title}</p>
                                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-600 font-mono">
                                            <span className="bg-slate-800 px-1.5 py-0.5 rounded">{pr.head}</span>
                                            <ChevronRight size={10} />
                                            <span className="bg-slate-800 px-1.5 py-0.5 rounded">{pr.base}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <User size={9} /> {pr.user?.login}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Clock size={9} /> {timeAgo(pr.createdAt)}
                                            </span>
                                            {pr.changedFiles != null && (
                                                <span className="flex items-center gap-1 text-[10px]">
                                                    <span className="text-emerald-400">+{pr.additions}</span>
                                                    <span className="text-red-400">-{pr.deletions}</span>
                                                    <span className="text-slate-500">({pr.changedFiles} files)</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition" />
                                </div>
                            </a>
                        ))}
                    </>
                )}

                {/* Commits Tab */}
                {activeTab === 'commits' && (
                    <>
                        {data?.commits?.length === 0 && (
                            <div className="text-center text-slate-600 py-8 text-sm">No commits found</div>
                        )}
                        {data?.commits?.map((commit, i) => (
                            <a key={commit.fullSha || i} href={commit.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-start gap-3 bg-[#111827] hover:bg-[#1a2235] border border-[#1e293b] rounded-xl p-3 transition-all group">
                                {commit.avatar ? (
                                    <img src={commit.avatar} alt={commit.author}
                                        className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 object-cover" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                        <GitCommit size={14} className="text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-200 group-hover:text-text-primary leading-snug truncate">{commit.message}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-slate-500">{commit.author}</span>
                                        <span className="text-[10px] text-slate-600">{timeAgo(commit.date)}</span>
                                        <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{commit.sha}</span>
                                    </div>
                                </div>
                                <ExternalLink size={11} className="text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition" />
                            </a>
                        ))}
                    </>
                )}

                {/* Branches Tab */}
                {activeTab === 'branches' && (
                    <>
                        {data?.branches?.length === 0 && (
                            <div className="text-center text-slate-600 py-8 text-sm">No branches found</div>
                        )}
                        {data?.branches?.map(branch => (
                            <div key={branch.name}
                                className="flex items-center gap-3 bg-[#111827] border border-[#1e293b] rounded-xl p-3">
                                <GitBranch size={14} className={`flex-shrink-0 ${branch.name === data?.repo?.defaultBranch ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-200 truncate">{branch.name}</span>
                                        {branch.name === data?.repo?.defaultBranch && (
                                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">default</span>
                                        )}
                                        {branch.protected && (
                                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                                <Lock size={8} /> protected
                                            </span>
                                        )}
                                    </div>
                                    {branch.sha && (
                                        <span className="text-[10px] text-slate-600 font-mono">{branch.sha}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default GitPanel;
