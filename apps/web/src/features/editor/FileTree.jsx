import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FileText,
    FileCode,
    FileJson,
    FileImage
} from 'lucide-react';

// File icon mapping
const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    const iconMap = {
        'js': FileCode,
        'jsx': FileCode,
        'ts': FileCode,
        'tsx': FileCode,
        'py': FileCode,
        'java': FileCode,
        'cpp': FileCode,
        'c': FileCode,
        'html': FileCode,
        'css': FileCode,
        'json': FileJson,
        'png': FileImage,
        'jpg': FileImage,
        'jpeg': FileImage,
        'gif': FileImage,
        'svg': FileImage
    };

    const IconComponent = iconMap[ext] || FileText;
    return IconComponent;
};

// TreeNode Component
const TreeNode = ({ node, level = 0, activePath, onFileClick }) => {
    const [isExpanded, setIsExpanded] = useState(level === 0); // Root level expanded by default
    const isActive = node.path === activePath;
    const isDirectory = node.type === 'directory';

    const handleClick = () => {
        if (isDirectory) {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(node);
        }
    };

    const Icon = isDirectory
        ? (isExpanded ? FolderOpen : Folder)
        : getFileIcon(node.name);

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition hover:bg-gray-100 ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-700'
                    }`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleClick}
            >
                {isDirectory && (
                    isExpanded ? (
                        <ChevronDown size={16} className="flex-shrink-0" />
                    ) : (
                        <ChevronRight size={16} className="flex-shrink-0" />
                    )
                )}
                {!isDirectory && <div className="w-4" />} {/* Indent for files */}

                <Icon
                    size={16}
                    className={`flex-shrink-0 ${isDirectory ? 'text-yellow-600' : 'text-gray-500'
                        }`}
                />

                <span className={`text-sm truncate ${isActive ? 'font-medium' : ''}`}>
                    {node.name}
                </span>

                {!isDirectory && (
                    <span className="text-xs text-gray-400 ml-auto">
                        {node.language}
                    </span>
                )}
            </div>

            {isDirectory && isExpanded && node.children && (
                <div>
                    {node.children.map((child, index) => (
                        <TreeNode
                            key={index}
                            node={child}
                            level={level + 1}
                            activePath={activePath}
                            onFileClick={onFileClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Main FileTree Component
const FileTree = ({ fileTree, activePath, onFileClick, workspaceName }) => {
    if (!fileTree || fileTree.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 text-sm">
                No files in workspace
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <Folder size={16} className="text-yellow-600" />
                    {workspaceName || 'Workspace'}
                </h3>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-2">
                {fileTree.map((node, index) => (
                    <TreeNode
                        key={index}
                        node={node}
                        activePath={activePath}
                        onFileClick={onFileClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileTree;
