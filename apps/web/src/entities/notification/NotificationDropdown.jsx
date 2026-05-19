import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, MessageSquare, FolderUp, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@app/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { NotificationType } from '@bloody-roar/shared-types';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            if (!token) return;
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [token]);

    // Real-time: register socket for live push notifications
    useEffect(() => {
        if (!user) return;
        const userId = user._id || user.id;
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('register_user', userId);
        });

        socketRef.current.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleNotifClick = async (notif) => {
        await markAsRead(notif._id);
        setIsOpen(false);
        if (notif.onModel === 'Issue' && notif.relatedId) {
            navigate(`/issue/${notif.relatedId}`);
        } else if (notif.onModel === 'Application' && notif.relatedId) {
            navigate('/dashboard');
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/all/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const relativeTime = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const getIcon = (type) => {
        switch (type) {
            case NotificationType.JOB_MATCH: return <Briefcase className="text-emerald-400" size={16} />;
            case NotificationType.APPLICATION_STATUS: return <Check className="text-blue-400" size={16} />;
            case NotificationType.NEW_APPLICATION: return <Bell className="text-amber-400" size={16} />;
            case NotificationType.NEW_COMMENT: return <MessageSquare className="text-blue-400" size={16} />;
            case NotificationType.CHAT_MESSAGE: return <MessageSquare className="text-sky-400" size={16} />;
            case NotificationType.WORKSPACE_UPLOADED: return <FolderUp className="text-violet-400" size={16} />;
            default: return <Bell className="text-slate-400" size={16} />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case NotificationType.JOB_MATCH: return 'bg-emerald-500/10';
            case NotificationType.APPLICATION_STATUS: return 'bg-blue-500/10';
            case NotificationType.NEW_APPLICATION: return 'bg-amber-500/10';
            case NotificationType.NEW_COMMENT: return 'bg-blue-500/10';
            case NotificationType.CHAT_MESSAGE: return 'bg-sky-500/10';
            case NotificationType.WORKSPACE_UPLOADED: return 'bg-violet-500/10';
            default: return 'bg-slate-500/10';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            [NotificationType.JOB_MATCH]: 'Job Match',
            [NotificationType.APPLICATION_STATUS]: 'Application Update',
            [NotificationType.NEW_APPLICATION]: 'New Application',
            [NotificationType.NEW_COMMENT]: 'New Comment',
            [NotificationType.CHAT_MESSAGE]: 'New Message',
            [NotificationType.WORKSPACE_UPLOADED]: 'Workspace Upload',
        };
        return labels[type] || type.replace(/_/g, ' ');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-[#334155] hover:bg-[#475569] rounded-xl transition-colors"
            >
                <Bell size={18} className="text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-text-primary text-xs flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-14 w-96 bg-[#1e293b] rounded-2xl border border-[#334155] shadow-2xl z-40 max-h-[500px] overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="p-4 border-b border-[#334155] flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
                            <h3 className="font-bold text-text-primary flex items-center gap-2">
                                <Bell size={16} className="text-blue-400" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-blue-500 text-text-primary text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors">
                                    <X size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto max-h-[380px]">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="text-slate-500" size={24} />
                                    </div>
                                    <p className="text-slate-400 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotifClick(notif)}
                                        className={`p-4 border-b border-[#334155] hover:bg-[#334155]/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 p-2 rounded-lg ${getIconBg(notif.type)}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold text-text-primary leading-tight">
                                                        {getTypeLabel(notif.type)}
                                                    </p>
                                                    <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                                                        {relativeTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
