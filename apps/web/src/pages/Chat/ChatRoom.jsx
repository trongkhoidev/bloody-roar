import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "@app/context/AuthContext";
import CodeEditor from "@features/editor/CodeEditor";
import FileUploader from "@features/issue-actions/FileUploader";
import {
    Send, Paperclip, AlertTriangle, ShieldCheck,
    Image as ImageIcon, X, Check, CheckCheck,
    MoreVertical, Search, Phone, Video, Info,
    Download, Forward, Copy as CopyIcon, Trash2,
    Star, Pin, Code, FolderUp, FolderOpen
} from "lucide-react";
import { useToast } from "@app/context/ToastContext";
import ConfirmationModal from "@shared/ui/ConfirmationModal";

const ChatRoom = ({ issueId, devId, issueTitle, isWidget = false }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // { messageId, x, y }
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const [warning, setWarning] = useState(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const sendingRef = useRef(false); // ✅ Lock for preventing duplicate sends
    const lastSendTimeRef = useRef(0); // ✅ Timestamp for debouncing
    const [activeCodeEditor, setActiveCodeEditor] = useState(null); // ✅ Code editor state
    const [showWorkspaceUploader, setShowWorkspaceUploader] = useState(false); // ✅ Workspace uploader modal
    const [activeWorkspace, setActiveWorkspace] = useState(null); // ✅ Active workspace data

    // ✅ Custom Alert/Modal Hooks/State
    const toast = useToast();
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        isDestructive: false
    });

    useEffect(() => {
        if (!issueId || !user) return;

        // Socket connection
        console.log("Connecting to socket...", import.meta.env.VITE_SOCKET_URL);
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on("connect", () => {
            console.log("Socket connected!");
            // Use composite room key if devId is provided
            socketRef.current.emit("join_room", devId ? { issueId, devId } : issueId);
        });

        socketRef.current.on("receive_message", (data) => {
            console.log("📨 Received message:", data);
            setMessages((prev) => {
                // Check for duplicate by ID
                if (prev.some(m => m._id === data._id)) {
                    console.log("Duplicate message, skipping");
                    return prev;
                }

                return [...prev, data];
            });
            setOtherUserTyping(false);
        });

        socketRef.current.on("message_deleted", (messageId) => {
            setMessages((prev) => prev.filter(m => m._id !== messageId));
        });

        socketRef.current.on("message_flagged", (data) => {
            setWarning(data.flagReason);
            setMessages((prev) => [...prev, { ...data, isLocalFlagged: true }]);
        });

        socketRef.current.on("user_typing", ({ userId }) => {
            if (userId !== (user?.id || user?._id)) {
                setOtherUserTyping(true);
                setTimeout(() => setOtherUserTyping(false), 3000);
            }
        });

        const fetchHistory = async () => {
            try {
                // Fetch isolated room history if devId is available
                const url = devId
                    ? `${import.meta.env.VITE_API_URL}/chat/room/${issueId}/${devId}`
                    : `${import.meta.env.VITE_API_URL}/chat/${issueId}`;

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const validMessages = (res.data.data || []).map(msg => ({
                    ...msg,
                    sender: (msg.sender && typeof msg.sender === 'object') ? msg.sender : { _id: "unknown", name: "Unknown" },
                    content: msg.content || "",
                    attachments: Array.isArray(msg.attachments) ? msg.attachments : []
                }));
                setMessages(validMessages);
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };

        fetchHistory();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [issueId, devId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);



    const handleTyping = () => {
        if (!socketRef.current) return;

        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.emit("typing", { issueId, devId, userId: user?.id || user?._id });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };

    // ✅ Code Editor Socket Listeners
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("code_snippet_created", ({ snippetId, language, code, createdBy }) => {
            setActiveCodeEditor({
                snippetId,
                language,
                initialCode: code,
                readOnly: createdBy !== (user?.id || user?._id)
            });
        });

        return () => {
            socketRef.current?.off("code_snippet_created");
        };
    }, [user]);

    // ✅ Workspace Socket Listeners
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("workspace_created", (workspaceData) => {
            console.log("📦 Workspace created:", workspaceData);
            // Optionally show a notification or update UI
        });

        return () => {
            socketRef.current?.off("workspace_created");
        };
    }, []);

    const sendMessage = async () => {
        const now = Date.now();

        // ✅ STRICT TRIPLE LOCK to prevent duplicates
        if (sendingRef.current) {
            console.log("🚫 Already sending, blocked");
            return;
        }

        if (now - lastSendTimeRef.current < 1000) {
            console.log("🚫 Too soon (debounce), blocked");
            return;
        }

        if (!socketRef.current) {
            toast.error("Not connected to chat server");
            return;
        }

        if (!newMessage.trim() && !attachmentPreview) {
            console.log("Empty message, skipping");
            return;
        }

        // ✅ CAPTURE data FIRST before clearing states
        const messageText = newMessage.trim();
        const attachment = attachmentPreview;

        // ✅ Clear input IMMEDIATELY for instant UX feedback
        setNewMessage("");
        setAttachmentPreview(null);
        setIsTyping(false);

        // ✅ Acquire locks
        sendingRef.current = true;
        lastSendTimeRef.current = now;

        try {
            let attachmentUrl = null;

            // Upload attachment if exists
            if (attachment) {
                console.log("📤 Uploading file...");
                const formData = new FormData();
                formData.append('file', attachment.file);

                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
                attachmentUrl = uploadRes.data.data.url;
                console.log("✅ File uploaded:", attachmentUrl);
            }

            const messageData = {
                issueId,
                devId,                           // for composite room key
                chatRoomId: devId ? `${issueId}_${devId}` : issueId,
                senderId: user?.id || user?._id,
                senderName: user?.name || "Anonymous",
                senderAvatar: user?.avatar || "",
                content: messageText || "",
                type: attachment ? "FILE" : "TEXT",
                attachments: attachmentUrl ? [attachmentUrl] : []
            };

            console.log("📨 Sending message:", messageData);

            // ✅ Emit to socket
            socketRef.current.emit("send_message", messageData);

        } catch (error) {
            console.error("Failed to send message", error);
            toast.error("Failed to send: " + error.message);
            // ✅ On error, restore the message (optional)
            // setNewMessage(messageText);
            // setAttachmentPreview(attachment);
        } finally {
            // ✅ Release lock after 1 second
            setTimeout(() => {
                sendingRef.current = false;
            }, 1000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation(); // ✅ Prevent event bubbling
            sendMessage();
        }
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onload = (event) => {
                    setAttachmentPreview({
                        file: blob,
                        preview: event.target.result,
                        name: `pasted-image-${Date.now()}.png`,
                        type: 'image'
                    });
                };

                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setAttachmentPreview({
                file: file,
                preview: file.type.startsWith('image/') ? event.target.result : null,
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'file'
            });
        };
        reader.readAsDataURL(file);
    };

    const openMessageMenu = (messageId, event) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setActiveMenu({
            messageId,
            x: rect.left,
            y: rect.bottom + 5
        });
    };

    const closeMenu = () => setActiveMenu(null);

    const copyMessage = (content) => {
        navigator.clipboard.writeText(content);
        toast.success("Message copied to clipboard!");
        closeMenu();
    };

    const forwardMessage = () => {
        // TODO: Implement forward functionality
        toast.info("Forward feature coming soon!");
        closeMenu();
    };

    const deleteMessage = (messageId) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Message",
            message: "Are you sure you want to delete this message? This cannot be undone.",
            isDestructive: true,
            onConfirm: () => {
                socketRef.current?.emit("delete_message", { issueId, messageId });
                setMessages(prev => prev.filter(m => m._id !== messageId));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                toast.success("Message deleted");
            }
        });
        closeMenu();
    };

    const filteredMessages = messages.filter(msg => {
        if (!searchQuery) return true;
        return msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const mediaMessages = messages.filter(m => m.attachments?.length > 0);
    const imageMessages = mediaMessages.filter(m =>
        m.attachments.some(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    );

    if (!user || !issueId) {
        return <div className="p-4 text-center text-gray-400">Loading chat...</div>;
    }

    return (
        <>
            <div className={`flex flex-col bg-white overflow-hidden ${isWidget ? 'h-full' : 'h-[600px] rounded-xl shadow-lg border border-gray-100'}`}>
                {/* Header - Hide if in Widget (Widget already has a header) */}
                {!isWidget && (
                    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                    {issueTitle?.charAt(0) || "C"}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{issueTitle}</h3>
                                <p className="text-xs text-gray-500">Active now</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <Search size={18} className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <Info size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Bar - Hide if in Widget */}
                {showSearch && !isWidget && (
                    <div className="border-b border-gray-200 p-3 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                        {filteredMessages.map((msg, index) => {
                            const sender = (msg.sender && typeof msg.sender === 'object') ? msg.sender : { _id: "unknown", name: "Unknown" };
                            const isMe = sender._id === (user?.id || user?._id);
                            const isFlagged = msg.isFlagged || msg.isLocalFlagged;

                            const prevMsg = filteredMessages[index - 1];
                            const showAvatar = !prevMsg || prevMsg.sender?._id !== sender._id;
                            const isSameSender = prevMsg && prevMsg.sender?._id === sender._id;
                            const spacingClass = isSameSender ? "mt-1" : "mt-4";

                            return (
                                <div key={msg._id || index} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} group ${spacingClass} transition-all`}>
                                    {/* Avatar */}
                                    {!isMe && (
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                                            <img
                                                src={sender.avatar || `https://ui-avatars.com/api/?name=${sender.name}&background=random`}
                                                alt={sender.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className={`flex-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && showAvatar && (
                                            <span className="text-xs text-gray-500 mb-1 px-2">{sender.name}</span>
                                        )}

                                        <div className="relative max-w-[75%] group">
                                            {/* Message Bubble */}
                                            <div className={`${isMe
                                                ? "bg-blue-600 text-white shadow-md rounded-2xl rounded-tr-sm"
                                                : "bg-white border border-gray-150 text-gray-800 shadow-sm rounded-2xl rounded-tl-sm"
                                                } px-5 py-3 relative max-w-full`}>
                                                {isFlagged ? (
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="line-through opacity-70 italic">{msg.content}</p>
                                                            <div className="flex items-center gap-1 mt-1.5 text-xs bg-black/10 px-2 py-1 rounded w-fit">
                                                                <ShieldCheck size={12} />
                                                                <span className="font-medium">{msg.flagReason || "Content Blocked"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="mb-2">
                                                                {msg.attachments.map((url, i) => (
                                                                    <div key={i} className="rounded-lg overflow-hidden">
                                                                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                                            <img
                                                                                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                                                                                alt="Attachment"
                                                                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`, '_blank')}
                                                                            />
                                                                        ) : (
                                                                            <a
                                                                                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs hover:underline"
                                                                            >
                                                                                <Paperclip size={12} /> {url.split('/').pop()}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* WORKSPACE message card */}
                                                        {msg.type === "WORKSPACE" ? (() => {
                                                            let ws = {};
                                                            try { ws = JSON.parse(msg.content); } catch { ws = { name: 'Workspace', fileCount: 0 }; }
                                                            return (
                                                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 min-w-[220px]">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <FolderOpen size={16} className="text-indigo-500" />
                                                                        <span className="text-sm font-semibold text-indigo-800">{ws.name || 'Workspace'}</span>
                                                                    </div>
                                                                    <p className="text-xs text-indigo-600">{ws.fileCount || 0} files uploaded</p>
                                                                    {ws.workspaceId && (
                                                                        <button
                                                                            onClick={() => setActiveWorkspace(ws)}
                                                                            className="mt-2 text-xs text-indigo-600 hover:underline font-medium"
                                                                        >
                                                                            Open Workspace →
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })() : msg.type === "CODE" ? (
                                                            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <Code size={12} />
                                                                        {msg.metadata?.language || "code"}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setActiveCodeEditor({
                                                                            snippetId: msg.metadata?.snippetId,
                                                                            language: msg.metadata?.language || "javascript",
                                                                            initialCode: msg.content,
                                                                            readOnly: true
                                                                        })}
                                                                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                                                    >
                                                                        Open in Editor
                                                                    </button>
                                                                </div>
                                                                <pre className="overflow-x-auto text-xs">
                                                                    <code>{msg.content}</code>
                                                                </pre>
                                                            </div>
                                                        ) : (
                                                            msg.content && <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                                        )}
                                                    </>
                                                )}

                                                {/* ✅ Timestamp - Only visible on hover */}
                                                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMe && <CheckCheck size={12} />}
                                                </div>
                                            </div>

                                            {/* 3-Dot Menu Button */}
                                            <button
                                                onClick={(e) => openMessageMenu(msg._id, e)}
                                                className={`absolute ${isMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-200 rounded-full`}
                                            >
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {otherUserTyping && (
                            <div className="flex gap-2 items-center">
                                <div className="w-8 h-8"></div>
                                <div className="bg-gray-200 rounded-2xl px-4 py-2 flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Info Panel */}
                    {showInfo && !isWidget && (
                        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
                            <div className="p-4">
                                <h3 className="font-semibold mb-4">Conversation Info</h3>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Media ({imageMessages.length})</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {imageMessages.slice(0, 9).map((msg, i) => (
                                            msg.attachments.map((url, j) => (
                                                <div key={`${i}-${j}`} className="aspect-square rounded overflow-hidden">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                                                        alt="Media"
                                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`, '_blank')}
                                                    />
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Files ({mediaMessages.length})</h4>
                                    <div className="space-y-2">
                                        {mediaMessages.slice(0, 5).map((msg, i) => (
                                            msg.attachments.filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).map((url, j) => (
                                                <a
                                                    key={`${i}-${j}`}
                                                    href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm"
                                                >
                                                    <Download size={16} className="text-gray-400" />
                                                    <span className="flex-1 truncate">{url.split('/').pop()}</span>
                                                </a>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning Toast */}
                {warning && (
                    <div className="bg-red-50 border-t border-red-200 p-2 flex items-center justify-center gap-2 text-red-600 text-sm">
                        <AlertTriangle size={16} />
                        <strong>AI Guard:</strong> {warning}
                    </div>
                )}

                {/* Attachment Preview */}
                {attachmentPreview && (
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
                            {attachmentPreview.type === 'image' ? (
                                <img src={attachmentPreview.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                    <Paperclip size={24} className="text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachmentPreview.name}</p>
                                <p className="text-xs text-gray-500">Ready to send</p>
                            </div>
                            <button
                                onClick={() => setAttachmentPreview(null)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-3 bg-white flex items-center gap-2">
                    {/* Attach File Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
                        title="Attach File"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Code Snippet Button */}
                    <button
                        onClick={() => {
                            const snippetId = `snippet-${Date.now()}`;
                            socketRef.current.emit("code_snippet_create", {
                                issueId,
                                language: "javascript",
                                initialCode: "// Start coding...",
                                createdBy: user?.id || user?._id
                            });
                            setActiveCodeEditor({
                                snippetId,
                                language: "javascript",
                                initialCode: "// Start coding...",
                                readOnly: false
                            });
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
                        title="Create Code Snippet"
                    >
                        <Code size={20} />
                    </button>

                    {/* ✅ Workspace Upload Button */}
                    <button
                        onClick={() => setShowWorkspaceUploader(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
                        title="Upload Workspace"
                    >
                        <FolderUp size={20} />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 outline-none resize-none text-sm placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            rows="1"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                        />
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() && !attachmentPreview}
                        className="bg-blue-500 text-white p-2.5 rounded-xl hover:bg-blue-600 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                    >
                        <Send size={18} className={newMessage.trim() ? "translate-x-0.5" : ""} />
                    </button>
                </div>
            </div>

            {/* Message Action Menu */}
            {activeMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={closeMenu}></div>
                    <div
                        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
                        style={{
                            left: `${activeMenu.x}px`,
                            top: `${activeMenu.y}px`
                        }}
                    >
                        <button
                            onClick={() => {
                                const msg = messages.find(m => m._id === activeMenu.messageId);
                                if (msg) copyMessage(msg.content);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                        >
                            <CopyIcon size={16} />
                            Copy
                        </button>
                        <button
                            onClick={() => {
                                const msg = messages.find(m => m._id === activeMenu.messageId);
                                if (msg) forwardMessage(msg);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                        >
                            <Forward size={16} />
                            Forward
                        </button>
                        <button
                            onClick={() => deleteMessage(activeMenu.messageId)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </>
            )}


            {/* ✅ Code Editor Modal */}
            {
                activeCodeEditor && (
                    <CodeEditor
                        {...activeCodeEditor}
                        socket={socketRef.current}
                        issueId={issueId}
                        user={user}
                        onClose={() => setActiveCodeEditor(null)}
                    />
                )
            }

            {/* ✅ Workspace Editor Modal */}
            {
                activeWorkspace && (
                    <CodeEditor
                        workspaceId={activeWorkspace.workspaceId}
                        workspaceName={activeWorkspace.name}
                        fileTree={activeWorkspace.fileTree}
                        socket={socketRef.current}
                        issueId={issueId}
                        user={user}
                        onClose={() => setActiveWorkspace(null)}
                    />
                )
            }

            {/* ✅ Workspace Uploader Modal */}
            {
                showWorkspaceUploader && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                            <div className="bg-gray-900 text-text-primary p-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="font-bold">Upload Workspace</h3>
                                <button
                                    onClick={() => setShowWorkspaceUploader(false)}
                                    className="p-2 hover:bg-gray-700 rounded transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6">
                                <FileUploader
                                    issueId={issueId}
                                    userId={user?.id || user?._id}
                                    socket={socketRef.current}
                                    onUploadComplete={(workspaceData) => {
                                        // Emit to socket with devId for proper room routing
                                        socketRef.current?.emit("workspace_upload", {
                                            issueId,
                                            devId,
                                            workspaceData,
                                            senderId: user?.id || user?._id,
                                            senderName: user?.name,
                                            senderAvatar: user?.avatar,
                                        });
                                        setActiveWorkspace(workspaceData);
                                        setShowWorkspaceUploader(false);
                                        toast.success("Workspace uploaded and shared!");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ✅ Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
        </>
    );
};

export default ChatRoom;
