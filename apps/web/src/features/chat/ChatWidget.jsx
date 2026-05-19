import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { MessageCircle, X, ChevronDown, Briefcase, History, Terminal, FolderUp, Github } from "lucide-react";
import ChatRoom from "@pages/Chat/ChatRoom";
import GitPanel from "@entities/workspace/ui/GitPanel";
import ScriptRunner from "@entities/workspace/ui/ScriptRunner";
import { useAuth } from "@app/context/AuthContext";
import { useChat } from "@app/context/ChatContext";

const ChatWidget = () => {
    const { user } = useAuth();
    const { isOpen, setIsOpen, activeChat, openChat: contextOpenChat, toggleChat, closeChat } = useChat();
    const [view, setView] = useState("LIST");
    const [widgetTab, setWidgetTab] = useState("CHAT");
    const [contacts, setContacts] = useState([]);
    const [minimized, setMinimized] = useState(false);
    const [workspace, setWorkspace] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (user) fetchContacts();
    }, [user]);

    // Socket: listen for chat_initiated (developer auto-opens after client accepts)
    useEffect(() => {
        if (!user) return;
        const userId = user._id || user.id;
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("register_user", userId);
        });

        socketRef.current.on("chat_initiated", (payload) => {
            // payload: { issueId, devId, clientId, clientName, clientAvatar, issueTitle }
            fetchContacts();
            contextOpenChat({
                issueId: payload.issueId,
                devId: payload.devId,
                name: payload.clientName,
                issueTitle: payload.issueTitle,
            });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user]);

    // Update internal view when context opens a specific chat
    useEffect(() => {
        if (activeChat) {
            setView("CHAT");
            setWidgetTab("CHAT");
            setMinimized(false);
            fetchWorkspace(activeChat.issueId);
        } else {
            setView("LIST");
            setWorkspace(null);
        }
    }, [activeChat]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/contacts`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContacts(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching contacts", error);
            setContacts([]);
        }
    };

    const fetchWorkspace = async (issueId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/workspace/issue/${issueId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWorkspace(res.data?.data || null);
        } catch (error) {
            console.error("Error fetching workspace for chat", error);
            setWorkspace(null);
        }
    };

    const handleOpenChat = (contact) => {
        contextOpenChat({
            issueId: contact.issueId,
            devId: contact.devId, // Use the consistent developer ID
            name: contact.name,
            issueTitle: contact.issueTitle
        });
    };

    if (!user) return null;

    // 1. Minimized Bubble State
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end animate-fade-in text-slate-800">
                {contacts.slice(0, 3).map((contact) => (
                    <div
                        key={contact._id}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition relative group"
                        onClick={() => handleOpenChat(contact)}
                        title={contact.name}
                    >
                        <img
                            src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.name}&background=random`}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                        />
                        {contact.status === 'working' && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                        <div className="absolute right-14 top-2 bg-black/80 text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {contact.name}
                        </div>
                    </div>
                ))}

                <button
                    onClick={toggleChat}
                    className="bg-blue-500 text-white p-4 rounded-full shadow-xl hover:bg-blue-600 transition transform hover:scale-110 cursor-pointer"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        );
    }

    // 2. Open Widget State
    return (
        <div className={`fixed bottom-0 right-4 md:right-8 z-50 bg-white shadow-2xl rounded-t-2xl border border-gray-200 flex flex-col transition-all duration-300 text-slate-800 ${minimized ? 'h-14 w-72' : 'h-[550px] w-full md:w-[400px]'}`}>

            {/* Header */}
            <div
                className="bg-slate-950 text-white p-3.5 rounded-t-2xl flex justify-between items-center cursor-pointer select-none border-b border-slate-800"
                onClick={() => closeChat()} /* ✅ Click name to minimize to icon */
            >
                <div className="flex items-center gap-2">
                    {view === "CHAT" && (
                        <div
                            className="bg-slate-800 p-1 rounded-full hover:bg-slate-700 mr-2"
                            onClick={(e) => { e.stopPropagation(); contextOpenChat(null); }}
                        >
                            <ChevronDown size={14} className="rotate-90 text-white" />
                        </div>
                    )}
                    <h3 className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px] text-white">
                        {(view === "CHAT" && activeChat) ? activeChat.name : "Messages"}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <X size={18} className="cursor-pointer hover:text-red-400 text-white" onClick={(e) => { e.stopPropagation(); closeChat(); }} />
                </div>
            </div>

            {/* Tabs — always show when in a chat */}
            {view === "CHAT" && activeChat && !minimized && (
                <div className="flex border-b border-gray-150 bg-gray-50/50">
                    <button
                        onClick={() => setWidgetTab("CHAT")}
                        className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${widgetTab === "CHAT" ? "text-blue-500 border-blue-500 bg-white" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                    >
                        <MessageCircle size={13} /> Chat
                    </button>
                    <button
                        onClick={() => setWidgetTab("GIT")}
                        className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${widgetTab === "GIT" ? "text-blue-500 border-blue-500 bg-white" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                    >
                        <Github size={13} /> Git
                    </button>
                    {workspace && (
                        <button
                            onClick={() => setWidgetTab("TERMINAL")}
                            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${widgetTab === "TERMINAL" ? "text-blue-500 border-blue-500 bg-white" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                        >
                            <Terminal size={13} /> Logs
                        </button>
                    )}
                </div>
            )}

            {/* Content Body (Hidden if minimized) */}
            {!minimized && (
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                    {view === "LIST" ? (
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {contacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                                    <MessageCircle size={32} className="mb-2 opacity-50" />
                                    <p>No active contacts</p>
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <div
                                        key={contact.compositeKey || contact._id}
                                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition flex items-center gap-3"
                                        onClick={() => handleOpenChat(contact)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.name}&background=random`}
                                                alt={contact.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            {contact.status === 'working' && (
                                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-800">{contact.name}</h4>
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                <Briefcase size={10} /> {contact.issueTitle}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {activeChat && (
                                <>
                                    {widgetTab === "CHAT" && (
                                        <ChatRoom
                                            issueId={activeChat.issueId}
                                            devId={activeChat.devId}
                                            issueTitle={activeChat.issueTitle}
                                            isWidget={true}
                                        />
                                    )}
                                    {widgetTab === "GIT" && (
                                        <div className="flex-1 overflow-auto">
                                            <GitPanel
                                                issueId={activeChat.issueId}
                                                isLite={true}
                                            />
                                        </div>
                                    )}
                                    {workspace && widgetTab === "TERMINAL" && (
                                        <div className="flex-1 overflow-hidden bg-gray-900">
                                            <ScriptRunner
                                                workspaceId={workspace.workspaceId}
                                                isLite={true}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default ChatWidget;
