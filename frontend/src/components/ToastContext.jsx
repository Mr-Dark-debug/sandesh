import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast } from './ui';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error'), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

    // ⚡ Bolt: Memoize context value to prevent re-renders of consumers (like ComingSoonButton)
    // when toast state changes (which triggers Provider re-render).
    // The `toasts` array is NOT in this value, so consumers don't need to update when toasts change.
    const contextValue = useMemo(() => ({
        addToast,
        removeToast,
        success,
        error,
        warning
    }), [addToast, removeToast, success, error, warning]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-0 right-0 z-50 p-6 space-y-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto"
                        style={{
                            animation: 'slideUp 200ms ease',
                            animationFillMode: 'forwards'
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
