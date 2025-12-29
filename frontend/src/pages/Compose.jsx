import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendMail, checkHealth } from '../api';
import { useToast } from '../components/ToastContext';
import { useConfirmation } from '../components/ConfirmationDialog';
import { Button } from '../components/ui';
import {
  X, Send, Minus, Maximize2, Paperclip,
  Image, Link, Smile, MoreVertical, Trash2,
  AlertCircle, ChevronDown, Loader2
} from 'lucide-react';

export default function Compose() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { confirm } = useConfirmation();

  const [to, setTo] = useState(location.state?.to || '');
  const [cc, setCc] = useState(location.state?.cc || '');
  const [subject, setSubject] = useState(location.state?.subject || '');
  const [body, setBody] = useState(location.state?.body || '');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [namespace, setNamespace] = useState('local');
  const [showCc, setShowCc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get namespace for hints
  useEffect(() => {
    checkHealth()
      .then(({ data }) => {
        if (data.namespace) {
          setNamespace(data.namespace);
        }
      })
      .catch(() => { });
  }, []);

  const hasContent = to || cc || subject || body;

  const validateEmail = (email) => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return trimmed.includes('@');
  };

  const validateForm = () => {
    const newErrors = {};

    const toList = to.split(',').map(s => s.trim()).filter(Boolean);
    if (toList.length === 0) {
      newErrors.to = 'Please add at least one recipient';
    } else {
      const invalidEmails = toList.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        newErrors.to = `Invalid format. Use username@${namespace}`;
      }
    }

    if (cc.trim()) {
      const ccList = cc.split(',').map(s => s.trim()).filter(Boolean);
      const invalidCc = ccList.filter(email => !validateEmail(email));
      if (invalidCc.length > 0) {
        newErrors.cc = 'Invalid format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSending(true);

    const toList = to.split(',').map(s => s.trim()).filter(Boolean);
    const ccList = cc.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await sendMail({
        to: toList,
        cc: ccList,
        subject: subject.trim() || '(No Subject)',
        body
      });

      toast.success('Message sent!');
      navigate('/');
    } catch (e) {
      console.error('Failed to send email:', e);
      const message = e.response?.data?.detail || 'Failed to send. Please try again.';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (hasContent) {
      const confirmed = await confirm('DISCARD_DRAFT');
      if (confirmed) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleDelete = async () => {
    if (hasContent) {
      const confirmed = await confirm('DISCARD_DRAFT');
      if (confirmed) {
        setTo('');
        setCc('');
        setSubject('');
        setBody('');
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Floating compose modal (Gmail-style)
  return (
    <div className="h-full flex items-end justify-end p-4 md:p-6 bg-transparent pointer-events-none">
      <div
        className={`
          pointer-events-auto
          bg-white rounded-t-lg shadow-2xl border border-[#E5E8EB]
          w-full max-w-2xl
          flex flex-col
          animate-[slideUp_200ms_ease]
          ${isMinimized ? 'h-12' : 'h-[80vh] max-h-[600px]'}
          transition-all duration-200
        `}
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between px-4 py-3
            bg-[#404040] text-white rounded-t-lg
            cursor-pointer
          "
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <h3 className="text-sm font-medium truncate">
            {subject || 'New Message'}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body - hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Form fields */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* To field */}
              <div className="flex items-center px-4 py-2 border-b border-[#E5E8EB] focus-within:bg-[#F6F8FC] focus-within:border-[#0B57D0] transition-colors">
                <label htmlFor="to-input" className="text-sm text-[#8B8B8B] w-12 cursor-pointer">To</label>
                <input
                  id="to-input"
                  type="text"
                  autoFocus
                  className={`
                    flex-1 text-sm text-[#3D3D3D] outline-none bg-transparent
                    placeholder:text-[#C0C0C0]
                    ${errors.to ? 'text-[#C4756E]' : ''}
                  `}
                  placeholder={`recipient@${namespace}`}
                  value={to}
                  onChange={e => {
                    setTo(e.target.value);
                    if (errors.to) setErrors(prev => ({ ...prev, to: null }));
                  }}
                  disabled={sending}
                />
                <button
                  onClick={() => setShowCc(!showCc)}
                  className="text-xs text-[#8B8B8B] hover:text-[#3D3D3D] px-2"
                  aria-expanded={showCc}
                  aria-label="Toggle Cc field"
                >
                  Cc
                </button>
              </div>
              {errors.to && (
                <div className="px-4 py-1 bg-[#C4756E]/5 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-[#C4756E]" />
                  <span className="text-xs text-[#C4756E]">{errors.to}</span>
                </div>
              )}

              {/* CC field (optional) */}
              {showCc && (
                <div className="flex items-center px-4 py-2 border-b border-[#E5E8EB] focus-within:bg-[#F6F8FC] focus-within:border-[#0B57D0] transition-colors">
                  <label htmlFor="cc-input" className="text-sm text-[#8B8B8B] w-12 cursor-pointer">Cc</label>
                  <input
                    id="cc-input"
                    type="text"
                    className="flex-1 text-sm text-[#3D3D3D] outline-none placeholder:text-[#C0C0C0] bg-transparent"
                    placeholder={`cc@${namespace}`}
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    disabled={sending}
                  />
                </div>
              )}

              {/* Subject field */}
              <div className="flex items-center px-4 py-2 border-b border-[#E5E8EB] focus-within:bg-[#F6F8FC] focus-within:border-[#0B57D0] transition-colors">
                <label htmlFor="subject-input" className="text-sm text-[#8B8B8B] w-12 cursor-pointer">Subject</label>
                <input
                  id="subject-input"
                  type="text"
                  className="flex-1 text-sm text-[#3D3D3D] outline-none placeholder:text-[#C0C0C0] bg-transparent"
                  placeholder="Subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={sending}
                />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden transition-colors focus-within:bg-[#F6F8FC]/30">
                <textarea
                  aria-label="Message body"
                  className="
                    w-full h-full px-4 py-3
                    text-sm text-[#3D3D3D] leading-relaxed
                    outline-none resize-none bg-transparent
                    placeholder:text-[#C0C0C0]
                  "
                  placeholder="Compose email"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  disabled={sending}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E8EB]">
              <div className="flex items-center gap-2">
                {/* Send button */}
                <button
                  onClick={handleSubmit}
                  disabled={sending || !to.trim()}
                  className="
                    flex items-center gap-2 px-5 py-2
                    bg-[#0B57D0] hover:bg-[#0842A0] text-white
                    rounded-full text-sm font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </button>

                {/* Formatting tools (placeholders) */}
                <div className="flex items-center gap-1 ml-2 border-l border-[#E5E8EB] pl-2">
                  <button
                    className="p-2 text-[#C0C0C0] cursor-not-allowed rounded-full"
                    title="Attach files (Coming soon)"
                    aria-label="Attach files (Coming soon)"
                    disabled
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-[#C0C0C0] cursor-not-allowed rounded-full"
                    title="Insert link (Coming soon)"
                    aria-label="Insert link (Coming soon)"
                    disabled
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-[#C0C0C0] cursor-not-allowed rounded-full"
                    title="Insert emoji (Coming soon)"
                    aria-label="Insert emoji (Coming soon)"
                    disabled
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-[#C0C0C0] cursor-not-allowed rounded-full"
                    title="Insert photo (Coming soon)"
                    aria-label="Insert photo (Coming soon)"
                    disabled
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-full"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-[#6B6B6B] hover:text-[#C4756E] hover:bg-[#C4756E]/10 rounded-full"
                  title="Discard draft"
                  aria-label="Discard draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
