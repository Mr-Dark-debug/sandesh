import React, { useEffect, useState } from 'react';
import { getUsers, createUser } from '../api';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Skeleton, EmptyState, Badge } from '../components/ui';
import {
  UserPlus, Shield, Users, AlertCircle,
  User, Crown, Settings, Mail, Search,
  MoreVertical, Eye, EyeOff, Check
} from 'lucide-react';

export default function Admin() {
  const toast = useToast();
  const { confirm } = useConfirmation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
      if (e.response?.status === 403) {
        setError('You do not have permission to access this page');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Minimum 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Letters, numbers, underscores only';
    } else if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      errors.username = 'Username already exists';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Minimum 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Confirm user creation
    const confirmed = await confirm({
      title: 'Create User Account',
      description: `A new user account "${username}" will be created. They will be able to send and receive emails in the local namespace.`,
      confirmText: 'Create User',
      severity: 'info'
    });

    if (!confirmed) return;

    setCreating(true);
    try {
      await createUser(username.trim(), password);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setShowForm(false);
      toast.success(`User "${username}" created successfully`);
      await loadUsers();
    } catch (e) {
      console.error('Failed to create user:', e);
      const message = e.response?.data?.detail || 'Failed to create user';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFormErrors({});
    setShowForm(false);
  };

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#C4756E]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#C4756E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Access Denied</h3>
          <p className="text-sm text-[#6B6B6B]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-sm">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3D3D3D]">Admin Console</h1>
              <p className="text-sm text-[#6B6B6B]">Manage users and system settings</p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="
                flex items-center gap-2 px-4 py-2.5
                bg-[#D7CE93] hover:bg-[#C9BF7D] text-[#3D3D3D]
                rounded-lg font-medium text-sm
                transition-colors shadow-sm
              "
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Form Panel */}
          {showForm && (
            <div className="lg:col-span-1 animate-[slideUp_200ms_ease]">
              <div className="bg-[#F6F8FC] rounded-xl border border-[#E5E8EB] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#E5E8EB]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#A3A380]" />
                    <h3 className="font-semibold text-[#3D3D3D]">New User</h3>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-xs text-[#8B8B8B] hover:text-[#3D3D3D]"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-5 space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      autoFocus
                      className={`
                        w-full px-3 py-2.5 text-sm
                        bg-white text-[#3D3D3D]
                        border rounded-lg
                        transition-colors
                        focus:outline-none focus:ring-2 focus:ring-[#A3A380]/20
                        ${formErrors.username
                          ? 'border-[#C4756E] focus:border-[#C4756E]'
                          : 'border-[#E5E8EB] focus:border-[#A3A380]'
                        }
                      `}
                      placeholder="e.g., alice"
                      value={username}
                      onChange={e => {
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                        if (formErrors.username) {
                          setFormErrors(prev => ({ ...prev, username: null }));
                        }
                      }}
                      disabled={creating}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-xs text-[#C4756E]">{formErrors.username}</p>
                    )}
                    {username && !formErrors.username && (
                      <p className="mt-1 text-xs text-[#8B8B8B]">
                        Email: {username}@local
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={`
                          w-full px-3 py-2.5 pr-10 text-sm
                          bg-white text-[#3D3D3D]
                          border rounded-lg
                          transition-colors
                          focus:outline-none focus:ring-2 focus:ring-[#A3A380]/20
                          ${formErrors.password
                            ? 'border-[#C4756E] focus:border-[#C4756E]'
                            : 'border-[#E5E8EB] focus:border-[#A3A380]'
                          }
                        `}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          if (formErrors.password) {
                            setFormErrors(prev => ({ ...prev, password: null }));
                          }
                        }}
                        disabled={creating}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#3D3D3D]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-xs text-[#C4756E]">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`
                        w-full px-3 py-2.5 text-sm
                        bg-white text-[#3D3D3D]
                        border rounded-lg
                        transition-colors
                        focus:outline-none focus:ring-2 focus:ring-[#A3A380]/20
                        ${formErrors.confirmPassword
                          ? 'border-[#C4756E] focus:border-[#C4756E]'
                          : 'border-[#E5E8EB] focus:border-[#A3A380]'
                        }
                      `}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value);
                        if (formErrors.confirmPassword) {
                          setFormErrors(prev => ({ ...prev, confirmPassword: null }));
                        }
                      }}
                      disabled={creating}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-[#C4756E]">{formErrors.confirmPassword}</p>
                    )}
                    {confirmPassword && password === confirmPassword && !formErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-[#7A9B6D] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={creating || !username.trim() || !password || !confirmPassword}
                    className="
                      w-full flex items-center justify-center gap-2
                      px-4 py-2.5 mt-2
                      bg-[#A3A380] hover:bg-[#8B8B68] text-white
                      rounded-lg font-medium text-sm
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    "
                  >
                    {creating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create User
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-xl border border-[#E5E8EB] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8EB] bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A3A380]" />
                  <h3 className="font-semibold text-[#3D3D3D]">System Users</h3>
                  <Badge variant="default">{users.length}</Badge>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users yet"
                  description="Create your first user to get started."
                  action={() => setShowForm(true)}
                  actionLabel="Add User"
                />
              ) : (
                <div className="divide-y divide-[#F0F0F0]">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                            ${user.is_admin
                              ? 'bg-gradient-to-br from-[#D7CE93] to-[#C9BF7D]'
                              : 'bg-gradient-to-br from-[#D8A48F] to-[#BB8588]'
                            }
                          `}
                        >
                          {user.is_admin ? (
                            <Crown className="w-5 h-5 text-[#3D3D3D]" />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#3D3D3D]">
                              {user.username}
                            </p>
                            {user.is_admin && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#A3A380]/10 text-[#A3A380] rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8B8B8B] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.username}@local
                          </p>
                        </div>
                      </div>

                      <button className="p-2 text-[#8B8B8B] hover:text-[#3D3D3D] hover:bg-[#F0F0F0] rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
