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
            case 'success': return <Check className="text-green-600" size={20} />;
            case 'warning': return <AlertCircle className="text-orange-600" size={20} />;
            case 'info': return <Info className="text-blue-600" size={20} />;
            default: return <Bell className="text-gray-600" size={20} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
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
                                <Bell size={18} />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Bell className="mx-auto text-gray-300 mb-2" size={48} />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {notif.time}
                                                </p>
                                            </div>
                                            {notif.unread && (
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
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
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
