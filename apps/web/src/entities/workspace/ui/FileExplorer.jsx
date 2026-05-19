import React, { useState, useMemo } from 'react';
import {
    ChevronRight, ChevronDown,
    FileCode, FileText, FileImage, File as FileIcon,
    FolderClosed, FolderOpen
} from 'lucide-react';

// Build tree from flat file paths
const buildTree = (files) => {
    const root = { name: '', type: 'folder', children: {}, files: [] };

    files.forEach((file) => {
        const parts = file.path.split('/');
        let current = root;

        parts.forEach((part, idx) => {
            if (idx === parts.length - 1) {
                current.files.push({ name: part, path: file.path, size: file.size, language: file.language });
            } else {
                if (!current.children[part]) {
                    current.children[part] = { name: part, type: 'folder', children: {}, files: [] };
                }
                current = current.children[part];
            }
        });
    });

    return root;
};

const getFileIcon = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go', 'rs', 'sol', 'rb', 'php', 'c', 'cpp', 'cs'];
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
    const textExts = ['md', 'txt', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css', 'env'];

    if (codeExts.includes(ext)) return <FileCode size={14} className="text-indigo-400" />;
    if (imageExts.includes(ext)) return <FileImage size={14} className="text-emerald-400" />;
    if (textExts.includes(ext)) return <FileText size={14} className="text-amber-400" />;
    return <FileIcon size={14} className="text-slate-400" />;
};

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const FolderNode = ({ node, depth, activeFile, onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand first 2 levels

    const folders = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));
    const files = node.files.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            {node.name && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-[#334155]/50 text-slate-300 text-xs transition-colors"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {isOpen ? <FolderOpen size={14} className="text-amber-400" /> : <FolderClosed size={14} className="text-amber-400" />}
                    <span className="truncate font-medium">{node.name}</span>
                </button>
            )}
            {(isOpen || !node.name) && (
                <>
                    {folders.map((f) => (
                        <FolderNode
                            key={f.name}
                            node={f}
                            depth={node.name ? depth + 1 : depth}
                            activeFile={activeFile}
                            onFileSelect={onFileSelect}
                        />
                    ))}
                    {files.map((file) => (
                        <button
                            key={file.path}
                            onClick={() => onFileSelect(file.path)}
                            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${activeFile === file.path
                                    ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400'
                                    : 'hover:bg-[#334155]/50 text-slate-400'
                                }`}
                            style={{ paddingLeft: `${(node.name ? depth + 1 : depth) * 12 + 8}px` }}
                        >
                            {getFileIcon(file.name)}
                            <span className="truncate flex-1 text-left">{file.name}</span>
                            <span className="text-[10px] text-slate-600 tabular-nums">{formatSize(file.size)}</span>
                        </button>
                    ))}
                </>
            )}
        </div>
    );
};

const FileExplorer = ({ files, activeFile, onFileSelect }) => {
    const tree = useMemo(() => buildTree(files), [files]);

    return (
        <div className="py-2">
            <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explorer</span>
                <span className="text-[10px] text-slate-600">{files.length} files</span>
            </div>
            {files.length === 0 ? (
                <div className="px-3 py-8 text-center">
                    <FolderOpen size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500">No files in workspace</p>
                    <p className="text-[10px] text-slate-600 mt-1">Upload a ZIP to get started</p>
                </div>
            ) : (
                <FolderNode
                    node={tree}
                    depth={0}
                    activeFile={activeFile}
                    onFileSelect={onFileSelect}
                />
            )}
        </div>
    );
};

export default FileExplorer;
