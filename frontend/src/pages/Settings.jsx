import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../api';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Button, Skeleton, Card, CardHeader, CardContent } from '../components/ui';
import {
    User, Mail, Edit2, Save, X, Info,
    AtSign, Shield, Palette, FileText, Copy, Check, HelpCircle
} from 'lucide-react';

// Pre-defined avatar colors
const AVATAR_COLORS = [
    "#A3A380", "#D8A48F", "#BB8588", "#D7CE93",
    "#8BA3A3", "#A38B8B", "#8B9BA3", "#A3988B"
];

export default function Settings() {
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirmation();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [signature, setSignature] = useState('');
    const [avatarColor, setAvatarColor] = useState('#A3A380');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const { data } = await getMyProfile();
            setProfile(data);
            setDisplayName(data.display_name || '');
            setSignature(data.signature || '');
            setAvatarColor(data.avatar_color || '#A3A380');
        } catch (e) {
            console.error('Failed to load profile:', e);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await updateMyProfile({
                display_name: displayName.trim() || null,
                signature: signature || null,
                avatar_color: avatarColor
            });
            setProfile(data);
            setEditing(false);
            toast.success('Profile updated successfully');

            // Update localStorage user
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                user.display_name = data.display_name;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (e) {
            console.error('Failed to update profile:', e);
            const message = e.response?.data?.detail || 'Failed to update profile';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDisplayName(profile?.display_name || '');
        setSignature(profile?.signature || '');
        setAvatarColor(profile?.avatar_color || '#A3A380');
        setEditing(false);
    };

    const copyEmail = () => {
        if (profile?.email_address) {
            navigator.clipboard.writeText(profile.email_address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="h-full bg-white overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3D3D3D]">Settings</h1>
                        <p className="text-sm text-[#6B6B6B] mt-1">Manage your profile and preferences</p>
                    </div>
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 text-[#8B8B8B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-lg"
                        title="Help"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Help Panel */}
                {showHelp && (
                    <Card className="mb-6 bg-[#F6F8FC] border-[#E5E8EB] animate-[slideUp_150ms_ease]">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-[#3D3D3D] mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#A3A380]" />
                                How Email Addresses Work
                            </h3>
                            <div className="space-y-3 text-sm text-[#6B6B6B]">
                                <p>
                                    <strong className="text-[#3D3D3D]">Your email address</strong> is automatically generated from your username
                                    and the system namespace. It looks like: <code className="bg-white px-1.5 py-0.5 rounded">username@namespace</code>
                                </p>
                                <p>
                                    <strong className="text-[#3D3D3D]">Display name</strong> is how you appear in emails and the UI.
                                    You can change this anytime. Recipients will see: <code className="bg-white px-1.5 py-0.5 rounded">Display Name &lt;email@namespace&gt;</code>
                                </p>
                                <p>
                                    <strong className="text-[#3D3D3D]">Username</strong> is fixed and cannot be changed because it's part of your email address.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#E5E8EB] flex items-center justify-between">
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="text-xs text-[#A3A380] hover:text-[#8B8B68]"
                                >
                                    Got it
                                </button>
                                <a
                                    href="/docs#/docs/identity"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#A3A380] hover:text-[#8B8B68] flex items-center gap-1"
                                >
                                    Read full documentation →
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Profile Card */}
                <Card className="mb-6">
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#A3A380]" />
                            <h2 className="font-semibold text-[#3D3D3D]">Profile</h2>
                        </div>
                        {!editing ? (
                            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                                <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                                    <Save className="w-4 h-4" />
                                    Save
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                                    style={{ backgroundColor: avatarColor }}
                                >
                                    {profile?.initials || 'U'}
                                </div>
                                {editing && (
                                    <div className="flex flex-wrap gap-1 max-w-[100px] justify-center">
                                        {AVATAR_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setAvatarColor(color)}
                                                className={`w-5 h-5 rounded-full transition-transform ${avatarColor === color ? 'ring-2 ring-offset-1 ring-[#3D3D3D] scale-110' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-4">
                                {/* Display Name */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8B8B8B] uppercase tracking-wider mb-1">
                                        Display Name
                                    </label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            className="
                        w-full px-3 py-2 text-sm
                        bg-[#F6F8FC] text-[#3D3D3D]
                        border border-[#E5E8EB] rounded-lg
                        focus:outline-none focus:border-[#A3A380] focus:ring-2 focus:ring-[#A3A380]/10
                      "
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <p className="text-base font-medium text-[#3D3D3D]">{profile?.display_name}</p>
                                    )}
                                </div>

                                {/* Username (Read-only) */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8B8B8B] uppercase tracking-wider mb-1">
                                        Username <span className="text-[#A3A380]">(cannot change)</span>
                                    </label>
                                    <p className="text-sm text-[#6B6B6B]">@{profile?.username}</p>
                                </div>

                                {/* Email Address (Read-only) */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8B8B8B] uppercase tracking-wider mb-1">
                                        Email Address <span className="text-[#A3A380]">(read-only)</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-[#3D3D3D] bg-[#F6F8FC] px-2 py-1 rounded">
                                            {profile?.email_address}
                                        </code>
                                        <button
                                            onClick={copyEmail}
                                            className="p-1.5 text-[#8B8B8B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded"
                                            title="Copy email"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-[#7A9B6D]" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role Badge */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8B8B8B] uppercase tracking-wider mb-1">
                                        Role
                                    </label>
                                    <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${profile?.is_admin ? 'bg-[#D7CE93]/20 text-[#8B8B68]' : 'bg-[#E5E8EB] text-[#6B6B6B]'}
                  `}>
                                        <Shield className="w-3 h-3" />
                                        {profile?.is_admin ? 'Administrator' : 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Signature Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#A3A380]" />
                            <h2 className="font-semibold text-[#3D3D3D]">Email Signature</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[#6B6B6B] mb-3">
                            This text will be automatically added to your outgoing emails.
                        </p>
                        <textarea
                            value={signature}
                            onChange={e => setSignature(e.target.value)}
                            disabled={!editing}
                            placeholder="Add a signature (optional)"
                            className={`
                w-full px-3 py-2 text-sm min-h-[100px]
                bg-[#F6F8FC] text-[#3D3D3D]
                border border-[#E5E8EB] rounded-lg
                focus:outline-none focus:border-[#A3A380] focus:ring-2 focus:ring-[#A3A380]/10
                resize-none
                ${!editing ? 'opacity-60 cursor-not-allowed' : ''}
              `}
                        />
                    </CardContent>
                </Card>

                {/* Sender Preview */}
                <Card className="bg-[#F6F8FC] border-[#E5E8EB]">
                    <CardContent className="p-4">
                        <h3 className="text-xs font-medium text-[#8B8B8B] uppercase tracking-wider mb-2">
                            How recipients see you
                        </h3>
                        <p className="text-sm text-[#3D3D3D] font-medium">
                            {displayName || profile?.display_name} <span className="text-[#8B8B8B]">&lt;{profile?.email_address}&gt;</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
