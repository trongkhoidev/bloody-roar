import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    Upload, File, AlertTriangle, CheckCircle, X, Loader2,
    FolderUp, Archive, FileCode, Image as ImageIcon, FileText
} from 'lucide-react';

const ACCEPTED_ARCHIVES = ['.zip', '.tar.gz', '.tgz', '.gz', '.bz2', '.7z', '.rar'];
const MAX_SIZE_MB = 100;

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'tgz'].includes(ext)) return <Archive size={14} className="text-amber-400" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <ImageIcon size={14} className="text-pink-400" />;
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs', 'php', 'rb', 'sol'].includes(ext)) return <FileCode size={14} className="text-indigo-400" />;
    return <FileText size={14} className="text-slate-400" />;
};

const FileUploader = ({ issueId, userId, socket, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [flaggedFiles, setFlaggedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]); // { file, name, size }
    const fileInputRef = useRef(null);
    const dirInputRef = useRef(null);

    const addFiles = useCallback((newFiles) => {
        setError('');
        const fileList = Array.from(newFiles);
        const validated = [];

        for (const file of fileList) {
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB limit`);
                continue;
            }
            validated.push({ file, name: file.name, size: file.size });
        }

        setSelectedFiles(prev => {
            // Deduplicate by name
            const existingNames = new Set(prev.map(f => f.name));
            const unique = validated.filter(f => !existingNames.has(f.name));
            return [...prev, ...unique];
        });
    }, []);

    const removeFile = (name) => {
        setSelectedFiles(prev => prev.filter(f => f.name !== name));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) addFiles(e.dataTransfer.files);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setError('');
        setProgress(0);
        setFlaggedFiles([]);

        try {
            const formData = new FormData();
            for (const { file } of selectedFiles) formData.append('files', file);
            formData.append('issueId', issueId);
            formData.append('userId', userId);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/workspace/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    onUploadProgress: (e) => {
                        setProgress(Math.round((e.loaded * 100) / e.total));
                    }
                }
            );

            const workspaceData = response.data.data;

            if (workspaceData.flaggedFiles?.length > 0) {
                setFlaggedFiles(workspaceData.flaggedFiles);
            }

            if (socket) {
                socket.emit('workspace_upload', {
                    issueId,
                    workspaceData: { ...workspaceData, uploadedBy: userId }
                });
            }

            if (onUploadComplete) onUploadComplete(workspaceData);
            setSelectedFiles([]);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload workspace');
        } finally {
            setTimeout(() => { setUploading(false); setProgress(0); }, 1500);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Drop Zone */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${dragActive
                    ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]'
                    : 'border-slate-700 hover:border-slate-500 bg-[#0f172a]'
                    } ${uploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />
                <input
                    ref={dirInputRef}
                    type="file"
                    multiple
                    webkitdirectory="true"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />

                <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                        <FolderUp size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-200">Drop files here or click to browse</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Archives: {ACCEPTED_ARCHIVES.join(', ')} — or any individual source files
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">Max {MAX_SIZE_MB}MB per file</p>
                    </div>
                    <button
                        type="button"
                        className="pointer-events-auto mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
                        onClick={(e) => { e.stopPropagation(); dirInputRef.current?.click(); }}
                    >
                        Or select an entire folder
                    </button>
                </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && !uploading && (
                <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#1e293b] flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                            <span className="ml-2 text-slate-500 font-normal">
                                ({formatBytes(selectedFiles.reduce((s, f) => s + f.size, 0))})
                            </span>
                        </span>
                        <button onClick={() => setSelectedFiles([])}
                            className="text-xs text-slate-500 hover:text-red-400 transition">Clear all</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#1e293b]">
                        {selectedFiles.map(({ name, size }) => (
                            <div key={name} className="flex items-center gap-3 px-4 py-2.5">
                                {getFileIcon(name)}
                                <span className="flex-1 text-xs text-slate-300 truncate font-mono">{name}</span>
                                <span className="text-[10px] text-slate-600 flex-shrink-0">{formatBytes(size)}</span>
                                <button onClick={() => removeFile(name)}
                                    className="text-slate-600 hover:text-red-400 transition flex-shrink-0">
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Loader2 size={18} className="text-indigo-400 animate-spin flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-200">Uploading workspace...</span>
                        <span className="ml-auto text-sm font-bold text-indigo-400">{progress}%</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && !uploading && (
                <button
                    onClick={handleUpload}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-text-primary text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                    <Upload size={16} />
                    Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} as Workspace
                </button>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-red-300">Upload Failed</p>
                        <p className="text-xs text-red-400 mt-0.5">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-300 transition">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* AI Guard Warnings */}
            {flaggedFiles.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <p className="text-xs font-bold text-amber-300">⚠️ AI Guard: Sensitive Data Detected</p>
                    </div>
                    <ul className="space-y-1">
                        {flaggedFiles.map((file, i) => (
                            <li key={i} className="text-xs text-amber-400 flex items-start gap-2">
                                <File size={11} className="flex-shrink-0 mt-0.5" />
                                <span><strong className="font-mono">{file.path}</strong>: {file.reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Success */}
            {progress === 100 && !error && !uploading && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300">Workspace uploaded successfully!</p>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
