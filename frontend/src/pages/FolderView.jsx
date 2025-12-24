import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { getMail, getFolders, moveMessage } from '../api';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Skeleton, EmptyState, Badge } from '../components/ui';
import {
  Mail, MailOpen, Inbox, Send, Trash2, Folder,
  ChevronDown, RefreshCw, AlertCircle, MoreVertical,
  Archive, Star, CheckSquare, Square, Check
} from 'lucide-react';

// Email list item component
function EmailListItem({ email, isSelected, onSelect, onNavigate }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp + 'Z');
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisYear(date)) {
      return format(date, 'MMM d');
    }
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div
      className={`
        group flex items-center gap-2 px-4 py-2
        border-b border-[#F0F0F0] last:border-b-0
        transition-colors duration-100
        cursor-pointer
        ${isSelected ? 'bg-[#D7CE93]/15' : !email.is_read ? 'bg-[#F6F8FC]' : 'bg-white hover:bg-[#F8F9FA]'}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(email.id); }}
        className="
          w-8 h-8 flex items-center justify-center
          text-[#8B8B8B] hover:text-[#3D3D3D]
          rounded hover:bg-[#E5E8EB]
          transition-colors
        "
      >
        {isSelected ? (
          <CheckSquare className="w-5 h-5 text-[#A3A380]" />
        ) : (
          <Square className="w-5 h-5" />
        )}
      </button>

      {/* Star (placeholder) */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="
          w-8 h-8 flex items-center justify-center
          text-[#8B8B8B] hover:text-[#D4A855]
          rounded hover:bg-[#E5E8EB]
          transition-colors
        "
      >
        <Star className="w-5 h-5" />
      </button>

      {/* Email Content - Clickable */}
      <Link
        to={`/message/${email.id}`}
        className="flex-1 flex items-center gap-3 min-w-0 py-1"
      >
        {/* Sender */}
        <div className="w-[200px] flex-shrink-0">
          <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-[#3D3D3D]' : 'text-[#3D3D3D]'}`}>
            {email.sender_display_name || (email.sender?.includes('<') ? email.sender.split('<')[0].trim() : email.sender?.split('@')[0]) || email.sender}
          </p>
        </div>

        {/* Subject & Preview */}
        <div className="flex-1 flex items-baseline gap-2 min-w-0">
          <span className={`text-sm truncate ${!email.is_read ? 'font-semibold text-[#3D3D3D]' : 'text-[#3D3D3D]'}`}>
            {email.subject || '(No Subject)'}
          </span>
          <span className="text-sm text-[#8B8B8B] truncate hidden md:inline">
            - {email.body?.substring(0, 80)}
          </span>
        </div>

        {/* Date */}
        <time className={`text-xs flex-shrink-0 ${!email.is_read ? 'font-semibold text-[#3D3D3D]' : 'text-[#8B8B8B]'}`}>
          {formatDate(email.timestamp)}
        </time>
      </Link>

      {/* Hover Actions */}
      <div className="hidden group-hover:flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center text-[#8B8B8B] hover:text-[#3D3D3D] rounded hover:bg-[#E5E8EB]"
          title="Archive"
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center text-[#8B8B8B] hover:text-[#C4756E] rounded hover:bg-[#E5E8EB]"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Loading skeleton for email list
function EmailListSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#F0F0F0]">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      ))}
    </div>
  );
}

// Bulk action bar
function BulkActionBar({ selectedCount, onClear, onMoveToTrash }) {
  if (selectedCount === 0) return null;

  return (
    <div className="
      flex items-center gap-4 px-4 py-2
      bg-[#F6F8FC] border-b border-[#E5E8EB]
      animate-[slideUp_150ms_ease]
    ">
      <button
        onClick={onClear}
        className="flex items-center gap-2 text-sm text-[#3D3D3D] hover:bg-[#E5E8EB] px-3 py-1.5 rounded-lg"
      >
        <Check className="w-4 h-4 text-[#A3A380]" />
        {selectedCount} selected
      </button>
      <div className="flex items-center gap-1">
        <button
          onClick={onMoveToTrash}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#C4756E] hover:bg-[#C4756E]/10 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFolders } = useOutletContext() || {};
  const toast = useToast();
  const { confirm } = useConfirmation();

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folders, setFolders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState(new Set());

  const loadMail = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    setSelectedEmails(new Set());

    try {
      const [mailRes, foldersRes] = await Promise.all([
        getMail(id),
        getFolders()
      ]);

      setEmails(mailRes.data);
      setFolders(foldersRes.data);
      const current = foldersRes.data.find(f => f.id === parseInt(id));
      setFolderName(current ? current.name : 'Folder');
    } catch (e) {
      console.error('Failed to load mail:', e);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadMail();
  }, [loadMail]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMail(false);
    refreshFolders?.();
  };

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmails.size === 0) return;

    const confirmed = await confirm({
      title: `Delete ${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''}`,
      description: `${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''} will be moved to Trash.`,
      confirmText: 'Delete',
      severity: 'warning'
    });

    if (confirmed) {
      const trashFolder = folders.find(f => f.name === 'Trash');
      if (!trashFolder) {
        toast.error('Trash folder not found');
        return;
      }

      try {
        for (const emailId of selectedEmails) {
          await moveMessage(emailId, trashFolder.id);
        }
        toast.success(`${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''} moved to Trash`);
        await loadMail(false);
        refreshFolders?.();
      } catch (e) {
        toast.error('Failed to delete some emails');
      }
    }
  };

  const getEmptyStateProps = () => {
    switch (folderName) {
      case 'Inbox':
        return {
          icon: Inbox,
          title: 'Your inbox is empty',
          description: 'Messages you receive will appear here. Send someone an email to get started!'
        };
      case 'Sent':
        return {
          icon: Send,
          title: 'No sent messages',
          description: 'Messages you send will appear here. Compose a new message to get started.'
        };
      case 'Trash':
        return {
          icon: Trash2,
          title: 'Trash is empty',
          description: 'Deleted messages will appear here.'
        };
      default:
        return {
          icon: Folder,
          title: 'This folder is empty',
          description: 'Move messages here to organize your mail.'
        };
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E8EB]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <EmailListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#C4756E]/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#C4756E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Unable to load emails</h3>
          <p className="text-sm text-[#6B6B6B] mb-6">{error}</p>
          <button
            onClick={() => loadMail()}
            className="
              inline-flex items-center gap-2 px-4 py-2
              bg-[#A3A380] text-white rounded-lg
              hover:bg-[#8B8B68] transition-colors
            "
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = emails.filter(e => !e.is_read).length;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with folder name and actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E8EB] bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          {/* Select all checkbox */}
          <button
            onClick={toggleSelectAll}
            className="
              w-8 h-8 flex items-center justify-center
              text-[#8B8B8B] hover:text-[#3D3D3D]
              rounded hover:bg-[#E5E8EB]
            "
          >
            {selectedEmails.size === emails.length && emails.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-[#A3A380]" />
            ) : selectedEmails.size > 0 ? (
              <div className="w-5 h-5 border-2 border-[#A3A380] rounded flex items-center justify-center">
                <div className="w-2 h-0.5 bg-[#A3A380]" />
              </div>
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <ChevronDown className="w-4 h-4 text-[#8B8B8B]" />

          <div className="ml-2 pl-4 border-l border-[#E5E8EB]">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                p-2 rounded-full text-[#6B6B6B]
                hover:bg-[#E5E8EB] hover:text-[#3D3D3D]
                transition-colors disabled:opacity-50
              "
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#8B8B8B]">
            {emails.length > 0 ? (
              <>1-{emails.length} of {emails.length}</>
            ) : null}
          </span>
        </div>
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedEmails.size}
        onClear={() => setSelectedEmails(new Set())}
        onMoveToTrash={handleBulkDelete}
      />

      {/* Folder title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EB]">
        <h2 className="text-base font-semibold text-[#3D3D3D]">{folderName}</h2>
        {unreadCount > 0 && (
          <span className="text-xs text-[#6B6B6B]">{unreadCount} unread</span>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <EmptyState {...getEmptyStateProps()} className="h-full" />
        ) : (
          <div>
            {emails.map(email => (
              <EmailListItem
                key={email.id}
                email={email}
                isSelected={selectedEmails.has(email.id)}
                onSelect={toggleEmailSelection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
