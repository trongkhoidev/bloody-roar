import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MessageSquare, MessageCircle, Clock, Search, ChevronRight, User } from "lucide-react";
import { useChat } from "@app/context/ChatContext";
import clsx from "clsx";

const MessagesDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { openChat } = useChat();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/contacts`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContacts(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = (contact) => {
        openChat({
            issueId: contact.issueId,
            devId: contact.devId,
            name: contact.name,
            issueTitle: contact.issueTitle
        });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "p-2 rounded-lg transition-all relative group",
                    isOpen ? "bg-[#262626] text-text-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
            >
                <MessageSquare size={18} />
                {contacts.some(c => c.unread) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-[#1c1c1c]">
                        <h3 className="text-[13px] font-semibold text-text-primary">Messages</h3>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#262626] text-text-muted rounded font-medium">
                            {contacts.length} Active
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[11px] text-text-muted">Syncing conversations...</span>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center mb-3">
                                    <MessageCircle size={20} className="text-text-muted" />
                                </div>
                                <p className="text-[12px] text-text-primary font-medium">No messages yet</p>
                                <p className="text-[11px] text-text-muted mt-1">Start a conversation from a bounty</p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {contacts.map((contact) => (
                                    <button
                                        key={contact.issueId + contact.devId}
                                        onClick={() => handleSelectChat(contact)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors text-left group"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.name}&background=random`}
                                                alt={contact.name}
                                                className="w-9 h-9 rounded-full object-cover border border-border-light"
                                            />
                                            {contact.status === 'working' && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#171717] rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[13px] font-medium text-text-primary truncate group-hover:text-blue-400 transition-colors">
                                                    {contact.name}
                                                </p>
                                                <span className="text-[10px] text-text-muted flex-shrink-0">
                                                    <Clock size={10} className="inline mr-1" />
                                                    Just now
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-text-muted truncate mt-0.5">
                                                Re: {contact.issueTitle}
                                            </p>
                                        </div>
                                        <ChevronRight size={12} className="text-[#3f3f46] group-hover:text-text-muted transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-border bg-[#1c1c1c]">
                        <button className="w-full py-1.5 text-[11px] text-text-muted hover:text-text-primary transition-colors font-medium">
                            View All Conversations
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesDropdown;
