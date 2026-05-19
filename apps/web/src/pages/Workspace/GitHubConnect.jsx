import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Github, CheckCircle, XCircle, Loader2, ExternalLink,
    ArrowLeft, Link2Off, AlertCircle
} from 'lucide-react';
import { useAuth } from '@app/context/AuthContext';

const GitHubConnect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(null); // null | 'checking' | 'connected' | 'disconnected' | 'error'
    const [ghInfo, setGhInfo] = useState(null);
    const [disconnecting, setDisconnecting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Check URL params for OAuth callback result
        const ghParam = searchParams.get('github');
        if (ghParam === 'connected') {
            setStatus('connected');
            checkStatus();
        } else if (ghParam === 'error') {
            setStatus('error');
        } else {
            checkStatus();
        }
    }, [searchParams]);

    const checkStatus = async () => {
        setStatus('checking');
        try {
            const { data } = await axios.get('/api/github/status', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.connected) {
                setStatus('connected');
                setGhInfo(data);
            } else {
                setStatus('disconnected');
            }
        } catch {
            setStatus('disconnected');
        }
    };

    const handleConnect = () => {
        // Redirect to GitHub OAuth with userId in state
        window.location.href = `/api/github/auth?userId=${user?._id || user?.id}`;
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Disconnect GitHub? This will remove your repo access.')) return;
        setDisconnecting(true);
        try {
            await axios.delete('/api/github/disconnect', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatus('disconnected');
            setGhInfo(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-400 hover:text-text-primary mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Profile
            </Link>

            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center">
                        <Github size={24} className="text-text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">GitHub Integration</h1>
                        <p className="text-sm text-slate-400">Connect your GitHub account to push code and create PRs</p>
                    </div>
                </div>

                {status === 'checking' && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    </div>
                )}

                {status === 'connected' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-400">Connected</p>
                                <p className="text-xs text-emerald-300">@{ghInfo?.username}</p>
                            </div>
                            {ghInfo?.avatarUrl && (
                                <img src={ghInfo.avatarUrl} alt="" className="w-10 h-10 rounded-full ml-auto border-2 border-emerald-500/30" />
                            )}
                        </div>

                        <a
                            href={`https://github.com/${ghInfo?.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-indigo-400 hover:underline"
                        >
                            <ExternalLink size={12} /> View GitHub Profile
                        </a>

                        <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-medium"
                        >
                            <Link2Off size={16} />
                            {disconnecting ? 'Disconnecting...' : 'Disconnect GitHub'}
                        </button>
                    </div>
                )}

                {status === 'disconnected' && (
                    <div className="space-y-4">
                        <div className="bg-[#0f172a] rounded-xl p-6 text-center">
                            <Github size={48} className="text-slate-600 mx-auto mb-4" />
                            <p className="text-sm text-slate-400 mb-6">Connect your GitHub to enable code push and PR creation</p>
                            <button
                                onClick={handleConnect}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2d333b] to-[#22272e] hover:from-[#3d434b] hover:to-[#32373e] text-text-primary rounded-xl transition-colors text-sm font-medium border border-[#444c56]"
                            >
                                <Github size={18} />
                                Connect with GitHub
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 space-y-1.5">
                            <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" /> Push commits to your repos</p>
                            <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" /> Create branches automatically</p>
                            <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" /> Submit PRs from workspace</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle size={24} className="text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-400">Connection Failed</p>
                            <p className="text-xs text-red-300 mt-1">
                                {searchParams.get('reason') || 'Unknown error'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitHubConnect;
