import React, { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, Award } from 'lucide-react';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'success',
            title: 'Application Accepted',
            message: 'Your application for "React Developer" has been accepted!',
            time: '5 min ago',
            unread: true
        },
        {
            id: 2,
            type: 'info',
            title: 'New Job Match',
            message: 'A new job matching your skills: "Node.js Backend"',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 3,
            type: 'warning',
            title: 'Bounty Expiring',
            message: 'Job "UI/UX Design" expires in 2 days',
            time: '3 hours ago',
            unread: false
        }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check className="text-emerald-400" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-400" size={18} />;
            case 'info': return <Info className="text-indigo-400" size={18} />;
            default: return <Bell className="text-slate-400" size={18} />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10';
            case 'warning': return 'bg-amber-500/10';
            case 'info': return 'bg-indigo-500/10';
            default: return 'bg-slate-500/10';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-[#334155] hover:bg-[#475569] rounded-xl transition-colors"
            >
                <Bell size={18} className="text-slate-300" />
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
                                <Bell size={18} className="text-indigo-400" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors"
                                >
                                    <X size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="text-slate-500" size={24} />
                                    </div>
                                    <p className="text-slate-400">No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 border-b border-[#334155] hover:bg-[#334155]/50 cursor-pointer transition-colors ${
                                            notif.unread ? 'bg-indigo-500/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 p-2 rounded-lg ${getIconBg(notif.type)}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white">
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {notif.time}
                                                </p>
                                            </div>
                                            {notif.unread && (
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
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
