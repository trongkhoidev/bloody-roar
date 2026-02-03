import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <MessageSquare size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
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
                    <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 max-h-96 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare size={18} />
                                Messages
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="overflow-y-auto max-h-80">
                            {messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <MessageSquare className="mx-auto text-gray-300 mb-2" size={48} />
                                    <p>No messages</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${msg.unread ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                {msg.avatar ? (
                                                    <img
                                                        src={msg.avatar}
                                                        alt={msg.sender}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                                                        {msg.sender[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {msg.sender}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {msg.time}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {msg.message}
                                                </p>
                                            </div>
                                            {msg.unread && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2 mx-auto">
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
