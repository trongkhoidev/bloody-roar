import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const MessagesDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages] = useState([
        {
            id: 1,
            sender: 'John Developer',
            avatar: null,
            message: 'Hi! I would like to discuss the React project...',
            time: '2 min ago',
            unread: true
        },
        {
            id: 2,
            sender: 'Sarah Client',
            avatar: null,
            message: 'When can you start working on the API?',
            time: '30 min ago',
            unread: true
        },
        {
            id: 3,
            sender: 'Mike Designer',
            avatar: null,
            message: 'I have completed the wireframes',
            time: '2 hours ago',
            unread: false
        }
    ]);

    const unreadCount = messages.filter(m => m.unread).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-[#334155] hover:bg-[#475569] rounded-xl transition-colors"
            >
                <MessageSquare size={18} className="text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-14 w-96 bg-[#1e293b] rounded-2xl border border-[#334155] shadow-2xl z-40 max-h-[480px] overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="p-4 border-b border-[#334155] flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <MessageSquare size={18} className="text-indigo-400" />
                                Messages
                                {unreadCount > 0 && (
                                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors"
                            >
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="overflow-y-auto max-h-80">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare className="text-slate-500" size={24} />
                                    </div>
                                    <p className="text-slate-400">No messages</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-4 border-b border-[#334155] hover:bg-[#334155]/50 cursor-pointer transition-colors ${
                                            msg.unread ? 'bg-indigo-500/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                {msg.avatar ? (
                                                    <img
                                                        src={msg.avatar}
                                                        alt={msg.sender}
                                                        className="w-10 h-10 rounded-xl"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                        {msg.sender[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-white">
                                                        {msg.sender}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {msg.time}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-400 truncate">
                                                    {msg.message}
                                                </p>
                                            </div>
                                            {msg.unread && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-[#334155] bg-[#0f172a]/50 text-center">
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-2 mx-auto transition-colors">
                                <Send size={14} />
                                View All Messages
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MessagesDropdown;
