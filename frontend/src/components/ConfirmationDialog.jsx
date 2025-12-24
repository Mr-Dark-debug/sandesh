import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Info, Trash2, LogOut, UserMinus, FolderMinus, X } from 'lucide-react';

const ConfirmationContext = createContext(null);

/**
 * Severity levels for confirmation dialogs
 */
const SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    DANGER: 'danger',
    CRITICAL: 'critical'
};

/**
 * Pre-defined confirmation configs for common actions
 */
const CONFIRMATION_CONFIGS = {
    // Authentication
    SIGN_OUT: {
        title: 'Sign Out',
        description: 'You will be signed out of Sandesh. Any unsaved drafts may be lost.',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        severity: SEVERITY.WARNING,
        icon: LogOut
    },

    // User Management
    CREATE_USER: {
        title: 'Create User',
        description: 'A new user account will be created with the provided credentials.',
        confirmText: 'Create',
        cancelText: 'Cancel',
        severity: SEVERITY.INFO,
        icon: Info
    },
    DELETE_USER: {
        title: 'Delete User',
        description: 'This user account and all associated emails and folders will be permanently deleted. This action cannot be undone.',
        confirmText: 'Delete User',
        cancelText: 'Cancel',
        severity: SEVERITY.CRITICAL,
        icon: UserMinus
    },

    // Email Operations
    DELETE_EMAIL: {
        title: 'Delete Email',
        description: 'This email will be moved to Trash.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        severity: SEVERITY.WARNING,
        icon: Trash2
    },
    DELETE_EMAIL_PERMANENT: {
        title: 'Permanently Delete',
        description: 'This email will be permanently deleted. This action cannot be undone.',
        confirmText: 'Delete Forever',
        cancelText: 'Cancel',
        severity: SEVERITY.DANGER,
        icon: Trash2
    },
    EMPTY_TRASH: {
        title: 'Empty Trash',
        description: 'All emails in Trash will be permanently deleted. This action cannot be undone.',
        confirmText: 'Empty Trash',
        cancelText: 'Cancel',
        severity: SEVERITY.CRITICAL,
        icon: Trash2
    },
    DISCARD_DRAFT: {
        title: 'Discard Draft',
        description: 'Your draft will be discarded. This action cannot be undone.',
        confirmText: 'Discard',
        cancelText: 'Keep Editing',
        severity: SEVERITY.WARNING,
        icon: AlertTriangle
    },

    // Folder Operations
    CREATE_FOLDER: {
        title: 'Create Folder',
        description: 'A new folder will be created.',
        confirmText: 'Create',
        cancelText: 'Cancel',
        severity: SEVERITY.INFO,
        icon: Info
    },
    DELETE_FOLDER: {
        title: 'Delete Folder',
        description: 'This folder will be deleted. All emails inside will be moved to Inbox.',
        confirmText: 'Delete Folder',
        cancelText: 'Cancel',
        severity: SEVERITY.DANGER,
        icon: FolderMinus
    },

    // System Configuration
    CHANGE_NAMESPACE: {
        title: 'Change Domain',
        description: 'Changing the namespace will affect all email addresses in the system. Existing users may experience issues.',
        confirmText: 'Change Domain',
        cancelText: 'Cancel',
        severity: SEVERITY.CRITICAL,
        icon: AlertTriangle
    }
};

/**
 * Confirmation Dialog Component
 */
function ConfirmationDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    severity = SEVERITY.WARNING,
    icon: Icon,
    loading = false,
    customContent = null
}) {
    const cancelRef = useRef(null);

    // Focus cancel button on open
    useEffect(() => {
        if (isOpen && cancelRef.current) {
            cancelRef.current.focus();
        }
    }, [isOpen]);

    // Handle keyboard
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const severityStyles = {
        info: {
            iconBg: 'bg-[#A3A380]/10',
            iconColor: 'text-[#A3A380]',
            buttonBg: 'bg-[#A3A380] hover:bg-[#8B8B68]'
        },
        warning: {
            iconBg: 'bg-[#D4A855]/10',
            iconColor: 'text-[#D4A855]',
            buttonBg: 'bg-[#D4A855] hover:bg-[#C49A45]'
        },
        danger: {
            iconBg: 'bg-[#C4756E]/10',
            iconColor: 'text-[#C4756E]',
            buttonBg: 'bg-[#C4756E] hover:bg-[#B06058]'
        },
        critical: {
            iconBg: 'bg-[#C4756E]/15',
            iconColor: 'text-[#A85550]',
            buttonBg: 'bg-[#A85550] hover:bg-[#8B4540]'
        }
    };

    const styles = severityStyles[severity] || severityStyles.warning;
    const DisplayIcon = Icon || AlertTriangle;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease]"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div
                className="
          relative bg-white rounded-2xl shadow-2xl max-w-md w-full
          animate-[slideUp_200ms_ease]
          border border-[#E5DCC0]
        "
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 text-[#8B8B8B] hover:text-[#3D3D3D] transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center mx-auto mb-5`}>
                        <DisplayIcon className={`w-7 h-7 ${styles.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h2
                        id="confirm-title"
                        className="text-xl font-bold text-[#3D3D3D] text-center mb-3"
                    >
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-[#6B6B6B] text-center leading-relaxed mb-6">
                        {description}
                    </p>

                    {/* Custom content */}
                    {customContent}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            ref={cancelRef}
                            onClick={onCancel}
                            disabled={loading}
                            className="
                flex-1 px-4 py-3 rounded-xl
                text-sm font-medium text-[#3D3D3D]
                bg-[#EFE8CE] hover:bg-[#E5DCC0]
                transition-colors
                disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-[#A3A380] focus:ring-offset-2
              "
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`
                flex-1 px-4 py-3 rounded-xl
                text-sm font-medium text-white
                ${styles.buttonBg}
                transition-colors
                disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-offset-2
                flex items-center justify-center gap-2
              `}
                        >
                            {loading && (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Confirmation Provider
 */
export function ConfirmationProvider({ children }) {
    const [dialog, setDialog] = useState({
        isOpen: false,
        config: {},
        resolve: null
    });

    const confirm = useCallback((configOrKey, customConfig = {}) => {
        return new Promise((resolve) => {
            // Get base config from predefined or use as custom
            const baseConfig = typeof configOrKey === 'string'
                ? CONFIRMATION_CONFIGS[configOrKey] || {}
                : configOrKey;

            setDialog({
                isOpen: true,
                config: { ...baseConfig, ...customConfig },
                resolve
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setDialog(prev => {
            prev.resolve?.(true);
            return { isOpen: false, config: {}, resolve: null };
        });
    }, []);

    const handleCancel = useCallback(() => {
        setDialog(prev => {
            prev.resolve?.(false);
            return { isOpen: false, config: {}, resolve: null };
        });
    }, []);

    return (
        <ConfirmationContext.Provider value={{ confirm, SEVERITY, CONFIGS: CONFIRMATION_CONFIGS }}>
            {children}
            <ConfirmationDialog
                isOpen={dialog.isOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                {...dialog.config}
            />
        </ConfirmationContext.Provider>
    );
}

/**
 * Hook to use confirmation dialogs
 */
export function useConfirmation() {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
}

export { SEVERITY, CONFIRMATION_CONFIGS };
