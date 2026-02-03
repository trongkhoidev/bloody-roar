import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, ChevronDown, Briefcase, User as UserIcon } from "lucide-react";
import ChatRoom from "../../pages/Chat/ChatRoom";
import { useAuth } from "../../context/AuthContext";

import { useChat } from "../../context/ChatContext";

const ChatWidget = () => {
    const { user } = useAuth();
    const { isOpen, setIsOpen, activeChat, openChat: contextOpenChat, toggleChat, closeChat } = useChat();
    const [view, setView] = useState("LIST");
    const [contacts, setContacts] = useState([]);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    // Update internal view when context opens a specific chat
    useEffect(() => {
        if (activeChat) {
            setView("CHAT");
            setMinimized(false);
        } else {
            setView("LIST");
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

    const handleOpenChat = (contact) => {
        contextOpenChat({
            issueId: contact.issueId,
            devId: contact._id,
            name: contact.name,
            issueTitle: contact.issueTitle
        });
        // contextOpenChat already sets isOpen=true in provider
    };

    if (!user) return null;

    // 1. Minimized Bubble State
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end animate-fade-in">
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
                        <div className="absolute right-14 top-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {contact.name}
                        </div>
                    </div>
                ))}

                <button
                    onClick={toggleChat}
                    className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-110"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        );
    }

    // 2. Open Widget State
    return (
        <div className={`fixed bottom-0 right-4 md:right-8 z-50 bg-white shadow-2xl rounded-t-2xl border border-gray-200 flex flex-col transition-all duration-300 ${minimized ? 'h-14 w-72' : 'h-[500px] w-[350px] md:w-[400px]'}`}>

            {/* Header */}
            <div
                className="bg-gray-900 text-white p-3 rounded-t-2xl flex justify-between items-center cursor-pointer select-none"
                onClick={() => closeChat()} /* ✅ Click name to minimize to icon */
            >
                <div className="flex items-center gap-2">
                    {view === "CHAT" && (
                        <div
                            className="bg-gray-700 p-1 rounded-full hover:bg-gray-600 mr-2"
                            onClick={(e) => { e.stopPropagation(); contextOpenChat(null); }}
                        >
                            <ChevronDown size={14} className="rotate-90" />
                        </div>
                    )}
                    <h3 className="font-bold text-sm">
                        {(view === "CHAT" && activeChat) ? activeChat.name : "Messages"}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {/* ✅ Removed minimize button - click header to minimize */}
                    <X size={18} className="cursor-pointer hover:text-red-400" onClick={(e) => { e.stopPropagation(); closeChat(); }} />
                </div>
            </div>

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
                                        key={contact._id}
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
                        <div className="flex-1 flex flex-col h-full">
                            {activeChat && (
                                <ChatRoom
                                    issueId={activeChat.issueId}
                                    issueTitle={activeChat.issueTitle}
                                    isWidget={true} // Add prop to adjust styling for widget mode
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
