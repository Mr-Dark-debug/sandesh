
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { getFolders, createFolder, checkHealth } from '../api';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Button, Badge, Skeleton } from '../components/ui';
import {
  Inbox, Send, Trash2, Folder, FolderPlus,
  LogOut, Plus, Settings, Menu, X, Mail,
  User, Search, MoreVertical, RefreshCw, ChevronDown, Server,
  BookOpen, Zap, ExternalLink
} from 'lucide-react';

export default function Layout() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [creatingFolderLoading, setCreatingFolderLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [namespace, setNamespace] = useState('local');
  const [expandedSections, setExpandedSections] = useState({ manage: true }); // Track expanded sections
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { confirm } = useConfirmation();

  const fetchSystemInfo = useCallback(async () => {
    try {
      const { data } = await checkHealth();
      if (data.namespace) setNamespace(data.namespace);
    } catch (e) {
      console.error('Failed to fetch system info:', e);
    }
  }, []);

  // ⚡ Bolt: Wrap in useCallback to prevent context consumers (FolderView) from re-rendering
  // when Layout state changes (e.g. menu toggles)
  const fetchFolders = useCallback(async () => {
    setFoldersLoading(true);
    try {
      const { data } = await getFolders();
      // Sort: Inbox, Sent, Trash, then others alphabetically
      const sorted = data.sort((a, b) => {
        const order = ['Inbox', 'Sent', 'Trash'];
        const aIdx = order.indexOf(a.name);
        const bIdx = order.indexOf(b.name);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      setFolders(sorted);

      // ⚡ Bolt: Removed redundant unreadCounts state calculation.
      // Unread counts are already present in the 'folder' object (folder.unread_count).
      // This prevents an extra re-render and redundant iteration.

    } catch (e) {
      console.error('Failed to load folders:', e);
      toast.error('Failed to load folders');
    } finally {
      setFoldersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      navigate('/login');
    } else {
      setUser(JSON.parse(u));
      fetchFolders();
      fetchSystemInfo();
    }
  }, [navigate, fetchFolders, fetchSystemInfo]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolderLoading(true);
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      await fetchFolders();
      toast.success(`Folder "${newFolderName}" created`);
    } catch (e) {
      const message = e.response?.data?.detail || 'Failed to create folder';
      toast.error(message);
    } finally {
      setCreatingFolderLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm('SIGN_OUT');
    if (confirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const getIcon = (name) => {
    switch (name) {
      case 'Inbox': return Inbox;
      case 'Sent': return Send;
      case 'Trash': return Trash2;
      default: return Folder;
    }
  };

  const isActive = (path) => location.pathname === path;

  // Determine if sidebar should be hidden from screen readers/keyboard
  // On mobile: hidden if menu is closed
  // On desktop: hidden if sidebar is closed
  // But CSS handles display/visibility via classes
  // We need to apply 'invisible' or 'visibility: hidden' when closed on desktop to remove from tab order

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#3D3D3D] text-white rounded-lg shadow-lg font-medium"
      >
        Skip to content
      </a>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          bg-[#F6F8FC] border-r border-[#E5E8EB]
          transform transition-all duration-200 ease-in-out
          flex flex-col

          /* Mobile: controlled by mobileMenuOpen */
          ${mobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'}

          /* Desktop: controlled by isSidebarOpen */
          md:translate-x-0 md:relative
          ${isSidebarOpen ? 'md:w-[280px]' : 'md:w-0 md:border-r-0 overflow-hidden md:invisible'}
        `}
        aria-hidden={mobileMenuOpen ? "false" : (isSidebarOpen ? "false" : "true")}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 min-w-[280px]">
          <Link to="/app/" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#3D3D3D] tracking-tight">Sandesh</h1>
              <p className="text-[10px] text-[#8B8B8B] -mt-0.5">Local Email</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compose Button */}
        <div className="px-4 py-3 min-w-[280px]">
          <Link
            to="/app/compose"
            className="
              w-full flex items-center gap-3 px-6 py-3.5
              bg-[#D7CE93] hover:bg-[#C9BF7D] 
              text-[#3D3D3D] font-semibold
              rounded-2xl shadow-sm hover:shadow-md
              transition-all duration-150
            "
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Compose
          </Link>
        </div>

        {/* Folders List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 min-w-[280px]">
          {foldersLoading ? (
            // Loading skeletons
            <div className="space-y-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {folders.map(folder => {
                const Icon = getIcon(folder.name);
                const active = isActive(`/app/folder/${folder.id}`);
                // ⚡ Bolt: Use unread_count directly from folder object
                const unreadCount = folder.unread_count || 0;

                return (
                  <Link
                    key={folder.id}
                    to={`/app/folder/${folder.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-4 px-4 py-2.5 rounded-full
                      text-[14px] font-medium transition-all duration-150
                      ${active
                        ? 'bg-[#D7CE93]/30 text-[#3D3D3D] font-semibold'
                        : 'text-[#3D3D3D] hover:bg-[#E5E8EB]'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-[#3D3D3D]' : 'text-[#6B6B6B]'}`} />
                    <span className="flex-1">{folder.name}</span>
                    {unreadCount > 0 && (
                      <Badge variant="unread" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Folder Management Section */}
          <div className="mt-4 pt-4 border-t border-[#E5E8EB]">
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider"
              onClick={() => setExpandedSections(prev => ({ ...prev, manage: !prev.manage }))}
            >
              <span>Manage</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.manage ? 'rotate-180' : ''}`} />
            </button>

            {expandedSections.manage && (
              <div className="mt-1 space-y-1">
                {/* Create Folder */}
                {!isCreatingFolder ? (
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="
                      flex items-center gap-4 w-full px-4 py-2.5 rounded-full
                      text-[14px] font-medium text-[#6B6B6B]
                      hover:bg-[#E5E8EB] hover:text-[#3D3D3D]
                      transition-all duration-150
                    "
                  >
                    <FolderPlus className="w-5 h-5" />
                    Create folder
                  </button>
                ) : (
                  <form onSubmit={handleCreateFolder} className="px-2 py-2">
                    <div className="flex flex-col gap-2">
                      <input
                        autoFocus
                        type="text"
                        className="
                          w-full px-3 py-2.5 text-sm
                          bg-white border border-[#E5E8EB] rounded-lg
                          focus:outline-none focus:border-[#A3A380] focus:ring-2 focus:ring-[#A3A380]/20
                        "
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        disabled={creatingFolderLoading}
                        onKeyDown={e => e.key === 'Escape' && setIsCreatingFolder(false)}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                          className="flex-1 px-3 py-1.5 text-sm text-[#6B6B6B] hover:bg-[#E5E8EB] rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newFolderName.trim() || creatingFolderLoading}
                          className="
                            flex-1 px-3 py-1.5 text-sm font-medium
                            bg-[#A3A380] text-white rounded-lg
                            hover:bg-[#8B8B68] disabled:opacity-50
                          "
                        >
                          {creatingFolderLoading ? '...' : 'Create'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Admin Link */}
                {user?.is_admin && (
                  <Link
                    to="/app/admin"
                    aria-current={isActive('/app/admin') ? 'page' : undefined}
                    className={`
                      flex items-center gap-4 px-4 py-2.5 rounded-full
                      text-[14px] font-medium transition-all duration-150
                      ${isActive('/app/admin')
                        ? 'bg-[#D7CE93]/30 text-[#3D3D3D] font-semibold'
                        : 'text-[#6B6B6B] hover:bg-[#E5E8EB] hover:text-[#3D3D3D]'
                      }
                    `}
                  >
                    <Settings className="w-5 h-5" />
                    Admin Console
                  </Link>
                )}

                {/* Documentation Link */}
                <Link
                  to="/docs"
                  className="
                    flex items-center gap-4 px-4 py-2.5 rounded-full
                    text-[14px] font-medium transition-all duration-150
                    text-[#6B6B6B] hover:bg-[#E5E8EB] hover:text-[#3D3D3D]
                  "
                >
                  <BookOpen className="w-5 h-5" />
                  Documentation
                </Link>

                {/* Swagger UI Link */}
                <a
                  href="/api/docs" target="_blank" rel="noopener noreferrer"
                  className="
                    flex items-center gap-4 px-4 py-2.5 rounded-full
                    text-[14px] font-medium transition-all duration-150
                    text-[#6B6B6B] hover:bg-[#E5E8EB] hover:text-[#3D3D3D]
                  "
                >
                  <Zap className="w-5 h-5" />
                  <span className="flex-1">API Documentation</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-[#E5E8EB] min-w-[280px]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="
                w-full flex items-center gap-3 p-3 rounded-xl
                hover:bg-white transition-colors text-left
              "
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8A48F] to-[#BB8588] flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#3D3D3D] truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-[#8B8B8B]">
                  {user?.is_admin ? 'Administrator' : 'User'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#8B8B8B] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className="
                    absolute bottom-full left-0 right-0 mb-2 z-50
                    bg-white rounded-xl shadow-lg border border-[#E5E8EB]
                    py-2 animate-[slideUp_150ms_ease]
                  "
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-[#E5E8EB]">
                    <p className="text-sm font-semibold text-[#3D3D3D]">
                      {user?.display_name || user?.username}
                    </p>
                    <p className="text-xs text-[#8B8B8B]">{user?.username}@{namespace}</p>
                  </div>
                  <Link
                    to="/app/settings"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="
                      w-full flex items-center gap-3 px-4 py-2.5
                      text-sm text-[#3D3D3D] hover:bg-[#F6F8FC]
                      transition-colors
                    "
                  >
                    <User className="w-4 h-4 text-[#6B6B6B]" />
                    Your Profile
                  </Link>
                  {user?.is_admin && (
                    <Link
                      to="/app/admin/system"
                      onClick={() => setShowUserMenu(false)}
                      role="menuitem"
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-sm text-[#3D3D3D] hover:bg-[#F6F8FC]
                        transition-colors
                      "
                    >
                      <Server className="w-4 h-4 text-[#6B6B6B]" />
                      System Settings
                    </Link>
                  )}
                  <div className="border-t border-[#E5E8EB] my-1" />
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="
                      w-full flex items-center gap-3 px-4 py-2.5
                      text-sm text-[#C4756E] hover:bg-[#C4756E]/5
                      transition-colors text-left
                    "
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="
          h-16 flex items-center justify-between gap-4
          px-4 md:px-6 
          bg-white border-b border-[#E5E8EB]
        ">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:block p-2 -ml-2 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-lg"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isSidebarOpen}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar (placeholder) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="
              flex items-center gap-3 px-4 py-2.5
              bg-[#F6F8FC] rounded-full
              border border-transparent hover:border-[#E5E8EB] hover:shadow-sm
              transition-all
            ">
              <Search className="w-5 h-5 text-[#8B8B8B]" />
              <input
                type="text"
                placeholder="Search (Coming soon)"
                aria-label="Search in mail"
                disabled
                title="Search is coming soon"
                className="
                  flex-1 bg-transparent text-sm text-[#3D3D3D]
                  placeholder:text-[#8B8B8B]
                  focus:outline-none cursor-not-allowed
                "
              />
            </div>
          </div>

          {/* Right side - mobile logo & refresh */}
          <div className="flex items-center gap-2">
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#3D3D3D]">Sandesh</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchFolders}
              className="p-2.5 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 overflow-hidden bg-white focus:outline-none"
          tabIndex="-1"
        >
          {/* ⚡ Bolt: Memoize context to avoid unnecessary re-renders of child routes */}
          <Outlet context={useMemo(() => ({ refreshFolders: fetchFolders, folders, foldersLoading }), [fetchFolders, folders, foldersLoading])} />
        </main>
      </div>
    </div>
  );
}
