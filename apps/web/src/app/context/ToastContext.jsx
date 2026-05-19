import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = (msg, duration) => addToast(msg, 'success', duration);
    const error = (msg, duration) => addToast(msg, 'error', duration);
    const info = (msg, duration) => addToast(msg, 'info', duration);
    const warning = (msg, duration) => addToast(msg, 'warning', duration);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out animate-slide-in
                            ${toast.type === 'success' ? 'bg-white border-green-200 text-gray-800' : ''}
                            ${toast.type === 'error' ? 'bg-white border-red-200 text-gray-800' : ''}
                            ${toast.type === 'info' ? 'bg-white border-blue-200 text-gray-800' : ''}
                            ${toast.type === 'warning' ? 'bg-white border-yellow-200 text-gray-800' : ''}
                        `}
                    >
                        <div className={`
                            ${toast.type === 'success' ? 'text-green-500' : ''}
                            ${toast.type === 'error' ? 'text-red-500' : ''}
                            ${toast.type === 'info' ? 'text-blue-500' : ''}
                            ${toast.type === 'warning' ? 'text-yellow-500' : ''}
                        `}>
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                            {toast.type === 'warning' && <AlertTriangle size={20} />}
                        </div>
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
