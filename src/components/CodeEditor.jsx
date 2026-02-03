import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Copy, Download, Save, X, Code2, Home, ChevronLeft, ChevronRight } from "lucide-react";
import FileTree from "./FileTree";

const CodeEditor = ({
    // Single file mode props
    snippetId,
    initialCode = "",
    language = "javascript",

    // Workspace mode props
    workspaceId,
    workspaceName,
    fileTree,

    // Common props
    socket,
    issueId,
    user,
    readOnly = false,
    onClose
}) => {
    const isWorkspaceMode = !!workspaceId;

    // State
    const [code, setCode] = useState(initialCode);
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [isSaving, setIsSaving] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [showFileTree, setShowFileTree] = useState(isWorkspaceMode);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    // Listen for code updates from other user (single file mode)
    useEffect(() => {
        if (!isWorkspaceMode) {
            const handleCodeUpdate = ({ snippetId: sid, code: newCode, language: newLang }) => {
                if (sid === snippetId) {
                    setCode(newCode);
                    if (newLang) setCurrentLanguage(newLang);
                }
            };

            const handleCodeFlagged = ({ snippetId: sid, reason }) => {
                if (sid === snippetId) {
                    alert(`⚠️ AI Guard: ${reason}`);
                }
            };

            socket.on("code_update", handleCodeUpdate);
            socket.on("code_flagged", handleCodeFlagged);

            return () => {
                socket.off("code_update", handleCodeUpdate);
                socket.off("code_flagged", handleCodeFlagged);
            };
        }
    }, [socket, snippetId, isWorkspaceMode]);

    // Listen for workspace file updates
    useEffect(() => {
        if (isWorkspaceMode) {
            const handleFileUpdated = ({ workspaceId: wsId, filePath, content }) => {
                if (wsId === workspaceId && currentFile?.path === filePath) {
                    setCode(content);
                }
            };

            socket.on("file_updated", handleFileUpdated);

            return () => {
                socket.off("file_updated", handleFileUpdated);
            };
        }
    }, [socket, workspaceId, currentFile, isWorkspaceMode]);

    // Handle file selection in workspace mode
    const handleFileClick = async (file) => {
        if (file.type === 'directory') return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/workspace/${workspaceId}/file/${file.path}`
            );

            setCurrentFile(file);
            setCode(response.data.data.content);
            setCurrentLanguage(response.data.data.language);

            // Emit socket event to notify others
            socket.emit("file_open", {
                issueId,
                workspaceId,
                filePath: file.path,
                userId: user?.id || user?._id
            });
        } catch (error) {
            console.error("Failed to load file:", error);
            alert("Failed to load file");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (value) => {
        setCode(value);

        if (readOnly) return;

        // Debounce socket emit
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (isWorkspaceMode) {
                // Workspace mode: emit file edit
                socket.emit("file_edit", {
                    issueId,
                    workspaceId,
                    filePath: currentFile?.path,
                    content: value,
                    userId: user?.id || user?._id
                });
            } else {
                // Single file mode: emit code sync
                socket.emit("code_sync", {
                    snippetId,
                    issueId,
                    newCode: value,
                    language: currentLanguage
                });
            }
        }, 500);
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            if (isWorkspaceMode) {
                // Save file to workspace
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/workspace/${workspaceId}/file/${currentFile.path}`,
                    { content: code }
                );

                socket.emit("file_save", {
                    issueId,
                    workspaceId,
                    filePath: currentFile.path,
                    content: code
                });
            } else {
                // Single snippet save
                socket.emit("code_snippet_save", {
                    snippetId,
                    issueId,
                    finalCode: code,
                    language: currentLanguage,
                    senderId: user?.id || user?._id,
                    senderName: user?.name || "Anonymous",
                    senderAvatar: user?.avatar || ""
                });
            }

            setTimeout(() => {
                setIsSaving(false);
                if (!isWorkspaceMode) {
                    onClose();
                }
            }, 1000);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save");
            setIsSaving(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        alert("✅ Code copied!");
    };

    const downloadCode = () => {
        const extensions = {
            javascript: "js",
            typescript: "ts",
            python: "py",
            java: "java",
            cpp: "cpp",
            html: "html",
            css: "css",
            json: "json",
            markdown: "md"
        };

        const ext = extensions[currentLanguage] || "txt";
        const filename = currentFile?.name || `snippet-${snippetId}.${ext}`;
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadWorkspace = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/workspace/${workspaceId}/download`,
                {},
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${workspaceName || 'workspace'}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download workspace");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <Code2 size={20} />
                        <h3 className="font-bold">
                            {isWorkspaceMode ? workspaceName : "Code Editor"}
                        </h3>

                        {isWorkspaceMode && currentFile && (
                            <>
                                <span className="text-gray-400">/</span>
                                <span className="text-sm text-gray-300">{currentFile.path}</span>
                            </>
                        )}

                        {!isWorkspaceMode && (
                            <select
                                value={currentLanguage}
                                onChange={(e) => setCurrentLanguage(e.target.value)}
                                className="bg-gray-700 px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={readOnly}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="json">JSON</option>
                                <option value="markdown">Markdown</option>
                            </select>
                        )}

                        {readOnly && <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Read-only</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        {isWorkspaceMode && (
                            <button
                                onClick={() => setShowFileTree(!showFileTree)}
                                className="p-2 hover:bg-gray-700 rounded transition"
                                title={showFileTree ? "Hide File Tree" : "Show File Tree"}
                            >
                                {showFileTree ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}

                        <button
                            onClick={copyCode}
                            className="p-2 hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
                            title="Copy code"
                        >
                            <Copy size={16} />
                            Copy
                        </button>

                        <button
                            onClick={isWorkspaceMode ? downloadWorkspace : downloadCode}
                            className="p-2 hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
                            title={isWorkspaceMode ? "Download workspace" : "Download file"}
                        >
                            <Download size={16} />
                            Download
                        </button>

                        {!readOnly && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 text-sm"
                            >
                                <Save size={16} />
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700 rounded transition ml-2"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* File Tree Sidebar (Workspace Mode) */}
                    {isWorkspaceMode && showFileTree && (
                        <div className="w-64 flex-shrink-0 overflow-hidden">
                            <FileTree
                                fileTree={fileTree}
                                activePath={currentFile?.path}
                                onFileClick={handleFileClick}
                                workspaceName={workspaceName}
                            />
                        </div>
                    )}

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
                                <div className="text-white">Loading file...</div>
                            </div>
                        )}

                        {isWorkspaceMode && !currentFile ? (
                            <div className="flex items-center justify-center h-full bg-gray-50">
                                <div className="text-center">
                                    <Home size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">Select a file to start editing</p>
                                    <p className="text-sm text-gray-500 mt-2">Choose a file from the tree on the left</p>
                                </div>
                            </div>
                        ) : (
                            <Editor
                                height="100%"
                                language={currentLanguage}
                                theme="vs-dark"
                                value={code}
                                onChange={handleCodeChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    readOnly: readOnly,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    wordWrap: "on",
                                    lineNumbers: "on",
                                    renderLineHighlight: "all",
                                    cursorSmoothCaretAnimation: "on",
                                    smoothScrolling: true
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer hint */}
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center border-t">
                    <span>💡 Changes sync in real-time. AI Guard scans for sensitive data.</span>
                    {!readOnly && <span className="text-gray-400">Auto-saves after typing stops</span>}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
