import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getMessage, moveMessage, getFolders } from '../api';
import { format } from 'date-fns';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Button, Skeleton, Card, ComingSoonButton } from '../components/ui';
import {
  ArrowLeft, Trash2, Mail, User, Calendar,
  Folder, AlertCircle, ChevronDown, Archive,
  Reply, Forward, MoreVertical, Printer, Star
} from 'lucide-react';

export default function MessageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useConfirmation();
  const { refreshFolders } = useOutletContext() || {};

  const [email, setEmail] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moving, setMoving] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Focus management for dropdowns
  const moveMenuRef = useRef(null);
  const moveTriggerRef = useRef(null);

  useEffect(() => {
    loadMessage();
  }, [id]);

  useEffect(() => {
    if (showMoveMenu && moveMenuRef.current) {
      const firstButton = moveMenuRef.current.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }
    }
    // Removed logic that auto-focuses trigger when menu closes to avoid stealing focus on Tab.
    // Trigger focus is now handled explicitly in event handlers.
  }, [showMoveMenu]);

  const loadMessage = async () => {
    setLoading(true);
    setError(null);

    try {
      const [messageRes, foldersRes] = await Promise.all([
        getMessage(id),
        getFolders()
      ]);
      setEmail(messageRes.data);
      setFolders(foldersRes.data);
      refreshFolders?.();
    } catch (e) {
      console.error('Failed to load message:', e);
      if (e.response?.status === 404) {
        setError('Message not found');
      } else {
        setError('Failed to load message');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (folderId, folderName) => {
    setMoving(true);
    try {
      await moveMessage(id, folderId);
      toast.success(`Moved to ${folderName}`);
      refreshFolders?.();
      navigate(`/folder/${folderId}`);
    } catch (e) {
      console.error('Failed to move message:', e);
      toast.error('Failed to move message');
    } finally {
      setMoving(false);
      setShowMoveMenu(false);
      moveTriggerRef.current?.focus();
    }
  };

  const handleDelete = async () => {
    const trashFolder = folders.find(f => f.name === 'Trash');
    const isInTrash = email?.folder_id === trashFolder?.id;

    if (isInTrash) {
      // Permanent delete confirmation
      const confirmed = await confirm('DELETE_EMAIL_PERMANENT');
      if (confirmed) {
        toast.warning('Permanent deletion not yet implemented');
      }
    } else if (trashFolder) {
      // Move to trash confirmation
      const confirmed = await confirm('DELETE_EMAIL');
      if (confirmed) {
        await handleMove(trashFolder.id, 'Trash');
      }
    }
  };

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowMoveMenu(false);
      moveTriggerRef.current?.focus();
      return;
    }

    if (!moveMenuRef.current) return;

    const buttons = Array.from(moveMenuRef.current.querySelectorAll('button'));
    if (buttons.length === 0) return;

    const currentIndex = buttons.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % buttons.length;
      buttons[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prevIndex].focus();
    } else if (e.key === 'Tab') {
      // Allow default Tab behavior (move focus to next element) but close the menu
      setShowMoveMenu(false);
    }
  };

  const getCurrentFolderName = () => {
    const folder = folders.find(f => f.id === email?.folder_id);
    return folder?.name || 'Unknown';
  };

  const getInitials = (sender) => {
    if (!sender) return 'U';
    const name = sender.split('@')[0];
    return name.charAt(0).toUpperCase();
  };

  const formatDateSafe = (timestampString, formatStr) => {
    try {
      if (!timestampString) return '';
      // Ensure we have a valid date string
      const dateStr = timestampString.endsWith('Z') ? timestampString : timestampString + 'Z';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, formatStr);
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back button skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Header skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>

          {/* Body skeleton */}
          <div className="space-y-3 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#C4756E]/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#C4756E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">
            {error || 'Message not found'}
          </h3>
          <p className="text-sm text-[#6B6B6B] mb-6">
            This message may have been moved or deleted.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2 px-4 py-2
              bg-[#EFE8CE] text-[#3D3D3D] rounded-lg
              hover:bg-[#E5DCC0] transition-colors
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Top Action Bar */}
        <div className="sticky top-0 bg-white z-10 border-b border-[#E5E8EB]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1">
              {/* Back button */}
              <button
                onClick={() => navigate(-1)}
                className="
                  p-2 rounded-full text-[#6B6B6B]
                  hover:bg-[#F6F8FC] hover:text-[#3D3D3D]
                  transition-colors
                "
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Archive button */}
              <ComingSoonButton
                icon={Archive}
                title="Archive (Coming soon)"
              />

              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={moving}
                className="
                  p-2 rounded-full text-[#6B6B6B]
                  hover:bg-[#C4756E]/10 hover:text-[#C4756E]
                  transition-colors disabled:opacity-50
                "
                title="Delete"
                aria-label="Delete message"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {/* Move to folder */}
              <div className="relative ml-2">
                <button
                  ref={moveTriggerRef}
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-lg
                    text-sm transition-colors
                    ${showMoveMenu
                      ? 'bg-[#F6F8FC] text-[#3D3D3D]'
                      : 'text-[#6B6B6B] hover:bg-[#F6F8FC] hover:text-[#3D3D3D]'
                    }
                  `}
                  aria-haspopup="true"
                  aria-expanded={showMoveMenu}
                  aria-label="Move to folder"
                >
                  <Folder className="w-4 h-4" />
                  Move to
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMoveMenu ? 'rotate-180' : ''}`} />
                </button>

                {showMoveMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => {
                         setShowMoveMenu(false);
                         moveTriggerRef.current?.focus();
                      }}
                    />
                    <div
                      ref={moveMenuRef}
                      className="
                        absolute left-0 top-full mt-1 z-50
                        w-48 bg-white rounded-lg shadow-lg border border-[#E5E8EB]
                        py-1 animate-[fadeIn_100ms_ease]
                      "
                      role="menu"
                      onKeyDown={handleMenuKeyDown}
                    >
                      {folders
                        .filter(f => f.id !== email.folder_id)
                        .map(folder => (
                          <button
                            key={folder.id}
                            onClick={() => handleMove(folder.id, folder.name)}
                            role="menuitem"
                            className="
                              w-full flex items-center gap-2.5 px-3 py-2
                              text-sm text-[#3D3D3D] text-left
                              hover:bg-[#F6F8FC] transition-colors
                              focus:bg-[#F6F8FC] focus:outline-none
                            "
                          >
                            <Folder className="w-4 h-4 text-[#6B6B6B]" />
                            {folder.name}
                          </button>
                        ))
                      }
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => window.print()}
                className="p-2 rounded-full text-[#6B6B6B] hover:bg-[#F6F8FC] hover:text-[#3D3D3D]"
                title="Print"
                aria-label="Print message"
              >
                <Printer className="w-5 h-5" />
              </button>
              <ComingSoonButton
                icon={Star}
                title="Star (Coming soon)"
              />
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="p-6">
          {/* Subject */}
          <h1 className="text-2xl font-normal text-[#3D3D3D] mb-6">
            {email.subject || '(No Subject)'}
          </h1>

          {/* Sender Info */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-semibold text-lg">
                  {getInitials(email.sender)}
                </span>
              </div>

              {/* Sender details */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#3D3D3D]">
                    {email.sender?.split('@')[0] || 'Unknown'}
                  </span>
                  <span className="text-sm text-[#8B8B8B]">
                    &lt;{email.sender}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#8B8B8B] mt-1">
                  <span>to {email.recipients?.map(r => r.split('@')[0]).join(', ')}</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="text-sm text-[#8B8B8B] text-right">
              <p>{formatDateSafe(email.timestamp, 'MMM d, yyyy, h:mm a')}</p>
              <p className="text-xs mt-0.5">({formatDateSafe(email.timestamp, 'EEEE')})</p>
            </div>
          </div>

          {/* Email Body */}
          <div className="
            text-[#3D3D3D] text-[15px] leading-relaxed
            whitespace-pre-wrap font-[system-ui]
            min-h-[200px]
          ">
            {email.body || '(No content)'}
          </div>

          {/* Reply Bar */}
          <div className="mt-12 pt-6 border-t border-[#E5E8EB]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/compose', {
                  state: {
                    to: email.sender,
                    subject: email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
                    body: `\n\nOn ${formatDateSafe(email.timestamp, 'PPP p')}, ${email.sender} wrote:\n> ${email.body.replace(/\n/g, '\n> ')}`
                  }
                })}
                className="
                  flex items-center gap-2 px-4 py-2.5
                  bg-white border border-[#E5E8EB] rounded-full
                  text-sm font-medium text-[#3D3D3D]
                  hover:bg-[#F6F8FC] hover:shadow-sm
                  transition-all
                "
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button
                onClick={() => navigate('/app/compose', {
                  state: {
                    subject: email.subject.startsWith('Fwd: ') ? email.subject : `Fwd: ${email.subject}`,
                    body: `\n\n---------- Forwarded message ---------\nFrom: ${email.sender}\nDate: ${formatDateSafe(email.timestamp, 'PPP p')}\nSubject: ${email.subject}\nTo: ${email.recipients?.join(', ')}\n\n${email.body}`
                  }
                })}
                className="
                  flex items-center gap-2 px-4 py-2.5
                  bg-white border border-[#E5E8EB] rounded-full
                  text-sm font-medium text-[#3D3D3D]
                  hover:bg-[#F6F8FC] hover:shadow-sm
                  transition-all
                "
              >
                <Forward className="w-4 h-4" />
                Forward
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
