import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
    const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
    const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <>
            <style>{`
                @keyframes toast-slide-in {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-toast-in {
                    animation: toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </>
    );
};

const ToastCard = ({ toast, onClose }) => {
    const { message, type } = toast;
    
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-lime-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/20 bg-zinc-950/95 text-zinc-100';
            case 'error':
                return 'border-rose-500/20 bg-zinc-950/95 text-zinc-100';
            default:
                return 'border-lime-500/20 bg-zinc-950/95 text-zinc-100';
        }
    };

    return (
        <div className={`animate-toast-in pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${getColors()}`}>
            <div className="pt-0.5">{getIcon()}</div>
            <div className="flex-1 text-xs font-semibold tracking-tight leading-snug">{message}</div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded-lg active:scale-90 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
