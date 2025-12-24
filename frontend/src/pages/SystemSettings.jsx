import React, { useEffect, useState } from 'react';
import { getSystemSettings, updateSystemSettings, getNamespaceWarnings } from '../api';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Skeleton, Card, CardHeader, CardContent } from '../components/ui';
import {
    Settings, Globe, Server, AlertTriangle,
    Save, RefreshCw, Info, CheckCircle, XCircle
} from 'lucide-react';

export default function SystemSettings() {
    const toast = useToast();
    const { confirm } = useConfirmation();

    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [instanceName, setInstanceName] = useState('');
    const [namespace, setNamespace] = useState('');
    const [originalNamespace, setOriginalNamespace] = useState('');
    const [warnings, setWarnings] = useState([]);
    const [checkingWarnings, setCheckingWarnings] = useState(false);
    const [namespaceValid, setNamespaceValid] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        // Validate namespace format
        const pattern = /^[a-z][a-z0-9\-]{1,19}$/;
        setNamespaceValid(pattern.test(namespace.toLowerCase()));

        // Check for warnings when namespace changes
        if (namespace !== originalNamespace && namespaceValid && namespace.length >= 2) {
            checkNamespaceWarnings(namespace);
        } else {
            setWarnings([]);
        }
    }, [namespace, originalNamespace]);

    const loadSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getSystemSettings();
            setSettings(data);
            setInstanceName(data.instance_name);
            setNamespace(data.mail_namespace);
            setOriginalNamespace(data.mail_namespace);
        } catch (e) {
            console.error('Failed to load settings:', e);
            if (e.response?.status === 403) {
                setError('You do not have admin privileges to access this page.');
            } else {
                setError('Failed to load system settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    const checkNamespaceWarnings = async (newNamespace) => {
        setCheckingWarnings(true);
        try {
            const { data } = await getNamespaceWarnings(newNamespace);
            setWarnings(data.warnings || []);
        } catch (e) {
            console.error('Failed to get warnings:', e);
        } finally {
            setCheckingWarnings(false);
        }
    };

    const handleSave = async () => {
        const namespaceChanged = namespace !== originalNamespace;

        if (namespaceChanged) {
            // Show critical confirmation for namespace change
            const confirmed = await confirm({
                title: 'Change Mail Namespace',
                description: `This will change all email addresses from @${originalNamespace} to @${namespace}. Existing emails will keep their original sender info. This action cannot be undone.`,
                confirmText: 'Change Namespace',
                severity: 'critical'
            });

            if (!confirmed) return;
        }

        setSaving(true);
        try {
            const { data } = await updateSystemSettings({
                instance_name: instanceName.trim(),
                mail_namespace: namespace.toLowerCase().trim(),
                confirm_namespace_change: namespaceChanged
            });

            setSettings(data);
            setOriginalNamespace(data.mail_namespace);
            setWarnings([]);
            toast.success('System settings updated successfully');
        } catch (e) {
            console.error('Failed to update settings:', e);
            const message = e.response?.data?.detail || 'Failed to update settings';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = instanceName !== settings?.instance_name || namespace !== originalNamespace;

    if (loading) {
        return (
            <div className="h-full bg-white overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-[#C4756E]/10 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-[#C4756E]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Access Denied</h3>
                    <p className="text-sm text-[#6B6B6B]">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-sm">
                        <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#3D3D3D]">System Settings</h1>
                        <p className="text-sm text-[#6B6B6B]">Configure your Sandesh instance</p>
                    </div>
                </div>

                {/* Info Panel */}
                <Card className="mb-6 bg-[#F6F8FC] border-[#E5E8EB]">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-[#A3A380] flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-[#6B6B6B]">
                                <p className="font-medium text-[#3D3D3D] mb-1">About the Mail Namespace</p>
                                <p>
                                    The mail namespace defines how email addresses are generated for all users.
                                    For example, with namespace "<strong>{namespace}</strong>", a user "alice" will have
                                    the email address: <code className="bg-white px-1.5 py-0.5 rounded">alice@{namespace}</code>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Instance Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#A3A380]" />
                            <h2 className="font-semibold text-[#3D3D3D]">Instance Configuration</h2>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Instance Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                                Instance Name
                            </label>
                            <input
                                type="text"
                                value={instanceName}
                                onChange={e => setInstanceName(e.target.value)}
                                className="
                  w-full px-3 py-2.5 text-sm
                  bg-white text-[#3D3D3D]
                  border border-[#E5E8EB] rounded-lg
                  focus:outline-none focus:border-[#A3A380] focus:ring-2 focus:ring-[#A3A380]/10
                "
                                placeholder="e.g., Sandesh, Office Mail, etc."
                            />
                            <p className="mt-1 text-xs text-[#8B8B8B]">
                                This name is displayed in the login page and system info.
                            </p>
                        </div>

                        {/* Mail Namespace */}
                        <div>
                            <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                                Mail Namespace
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B8B]">@</span>
                                <input
                                    type="text"
                                    value={namespace}
                                    onChange={e => setNamespace(e.target.value.toLowerCase())}
                                    className={`
                    w-full pl-7 pr-10 py-2.5 text-sm
                    bg-white text-[#3D3D3D]
                    border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-[#A3A380]/10
                    ${!namespaceValid && namespace ? 'border-[#C4756E] focus:border-[#C4756E]' : 'border-[#E5E8EB] focus:border-[#A3A380]'}
                  `}
                                    placeholder="sandesh"
                                />
                                {namespace && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {namespaceValid ? (
                                            <CheckCircle className="w-4 h-4 text-[#7A9B6D]" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-[#C4756E]" />
                                        )}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-[#8B8B8B]">
                                2-20 characters, lowercase letters, numbers, and hyphens. Must start with a letter.
                            </p>
                        </div>

                        {/* Email Example */}
                        <div className="p-3 bg-[#F6F8FC] rounded-lg">
                            <p className="text-xs text-[#8B8B8B] mb-1">Email addresses will look like:</p>
                            <p className="text-sm font-medium text-[#3D3D3D]">
                                username<span className="text-[#A3A380]">@{namespace || 'namespace'}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Namespace Change Warnings */}
                {warnings.length > 0 && (
                    <Card className="mb-6 border-[#F5C76A]">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-[#D4A855] flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-[#3D3D3D] mb-2">
                                        Changing the namespace will affect all users
                                    </p>
                                    <ul className="space-y-1">
                                        {warnings.map((warning, idx) => (
                                            <li key={idx} className="text-sm text-[#6B6B6B] flex items-start gap-2">
                                                <span className="text-[#D4A855] mt-1">•</span>
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E8EB]">
                    <button
                        onClick={loadSettings}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-lg"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges || !namespaceValid}
                        className="
              flex items-center gap-2 px-6 py-2.5
              bg-[#A3A380] hover:bg-[#8B8B68] text-white
              rounded-lg font-medium text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
                    >
                        {saving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
