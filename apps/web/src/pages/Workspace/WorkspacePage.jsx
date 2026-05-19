import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Loader2, FolderOpen, GitBranch, GitCommit,
    GitPullRequest, Save, Upload, AlertCircle
} from 'lucide-react';
import FileExplorer from '@entities/workspace/ui/FileExplorer';
import GitPanel from '@entities/workspace/ui/GitPanel';
import ActivityTimeline from '@entities/workspace/ui/ActivityTimeline';
import ScriptRunner from '@entities/workspace/ui/ScriptRunner';
import Editor from '@monaco-editor/react';

const WorkspacePage = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFile, setActiveFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [lastKnownUpdate, setLastKnownUpdate] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // editor | git | activity
    const token = localStorage.getItem('token');

    const fetchWorkspace = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkspace(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load workspace');
        } finally {
            setLoading(false);
        }
    }, [workspaceId, token]);

    useEffect(() => {
        fetchWorkspace();
    }, [fetchWorkspace]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handler = (e) => {
            if (unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [unsavedChanges]);

    const handleFileSelect = async (filePath) => {
        if (unsavedChanges && !window.confirm('You have unsaved changes. Discard?')) return;

        try {
            const { data } = await axios.get(
                `/api/workspace/${workspaceId}/file/${encodeURIComponent(filePath)}`
            );
            setActiveFile({ path: filePath, language: data.data.language });
            setFileContent(data.data.content);
            setLastKnownUpdate(data.data.updatedAt);
            setUnsavedChanges(false);
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    };

    const handleEditorChange = (value) => {
        setFileContent(value);
        setUnsavedChanges(true);
    };

    const handleSave = async () => {
        if (!activeFile) return;
        setSaving(true);
        try {
            const { data } = await axios.put(
                `/api/workspace/${workspaceId}/file/${encodeURIComponent(activeFile.path)}`,
                { content: fileContent, lastKnownUpdate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUnsavedChanges(false);
            setLastKnownUpdate(data.data.updatedAt);
            fetchWorkspace();
        } catch (err) {
            if (err.response?.status === 409) {
                if (window.confirm('File was modified elsewhere. Reload latest version?')) {
                    await handleFileSelect(activeFile.path);
                }
            } else {
                console.error('Save failed:', err);
            }
        } finally {
            setSaving(false);
        }
    };

    // Language detection
    const getLanguage = (filePath) => {
        const ext = filePath?.split('.').pop()?.toLowerCase();
        const langMap = {
            js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
            py: 'python', rb: 'ruby', java: 'java', go: 'go', rs: 'rust',
            html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'markdown',
            yml: 'yaml', yaml: 'yaml', sol: 'solidity', sh: 'shell',
            sql: 'sql', xml: 'xml', php: 'php', c: 'c', cpp: 'cpp',
        };
        return langMap[ext] || 'plaintext';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-indigo-500 animate-spin" size={48} />
                    <p className="text-slate-400 font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                    <p className="text-red-400 font-medium">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-indigo-400 hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#1e293b] border-b border-[#334155] px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <FolderOpen size={18} className="text-indigo-400" />
                        <h1 className="text-text-primary font-semibold text-sm">{workspace?.name}</h1>
                    </div>
                    {workspace?.branch?.name && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <GitBranch size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-medium">{workspace.branch.name}</span>
                        </div>
                    )}
                    {workspace?.status && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${workspace.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            workspace.status === 'ARCHIVED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {workspace.status}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFile && (
                        <button
                            onClick={handleSave}
                            disabled={!unsavedChanges || saving}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${unsavedChanges
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-text-primary'
                                : 'bg-[#334155] text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            <Save size={14} />
                            {saving ? 'Saving...' : unsavedChanges ? 'Save' : 'Saved'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* File Explorer */}
                <div className="w-64 bg-[#1e293b] border-r border-[#334155] flex-shrink-0 overflow-y-auto">
                    <FileExplorer
                        files={workspace?.files || []}
                        activeFile={activeFile?.path}
                        onFileSelect={handleFileSelect}
                    />
                </div>

                {/* Center: Editor or Right Panel Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex gap-0 bg-[#1e293b] border-b border-[#334155] flex-shrink-0">
                        {['editor', 'terminal', 'git', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 border-b-2 ${activeTab === tab
                                    ? 'text-indigo-400 border-indigo-400 bg-[#0f172a]'
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                            >
                                {tab === 'editor' && <><FolderOpen size={14} />Editor</>}
                                {tab === 'terminal' && <><span className="text-[11px]">⚡</span>Terminal</>}
                                {tab === 'git' && <><GitCommit size={14} />Git</>}
                                {tab === 'activity' && <><GitPullRequest size={14} />Activity</>}
                            </button>
                        ))}
                        {activeFile && (
                            <div className="flex items-center gap-2 px-3 ml-auto">
                                <span className="text-xs text-slate-500">{activeFile.path}</span>
                                {unsavedChanges && <span className="w-2 h-2 bg-amber-400 rounded-full" />}
                            </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'editor' && (
                            activeFile ? (
                                <Editor
                                    height="100%"
                                    language={getLanguage(activeFile.path)}
                                    value={fileContent}
                                    onChange={handleEditorChange}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: true },
                                        wordWrap: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 16 },
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <div className="text-center">
                                        <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="text-lg font-medium">Select a file to edit</p>
                                        <p className="text-sm mt-1">Choose from the file explorer on the left</p>
                                    </div>
                                </div>
                            )
                        )}
                        {activeTab === 'terminal' && (
                            <ScriptRunner workspaceId={workspaceId} />
                        )}
                        {activeTab === 'git' && (
                            <GitPanel
                                workspace={workspace}
                                workspaceId={workspaceId}
                                onRefresh={fetchWorkspace}
                            />
                        )}
                        {activeTab === 'activity' && (
                            <ActivityTimeline workspace={workspace} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePage;
