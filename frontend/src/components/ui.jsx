import React, { useId } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Primary button with Sandesh styling
 */
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg border-none cursor-pointer
    transition-all duration-150 ease-in-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[#A3A380] text-white
      hover:bg-[#8B8B68] 
      focus-visible:ring-[#A3A380]
    `,
    accent: `
      bg-[#D7CE93] text-[#3D3D3D]
      hover:bg-[#C9BF7D]
      focus-visible:ring-[#D7CE93]
    `,
    danger: `
      bg-[#C4756E] text-white
      hover:bg-[#B06058]
      focus-visible:ring-[#C4756E]
    `,
    ghost: `
      bg-transparent text-[#6B6B6B]
      hover:bg-[#EFE8CE]
      focus-visible:ring-[#A3A380]
    `,
    outline: `
      bg-white text-[#3D3D3D] border border-[#E5DCC0]
      hover:bg-[#EFE8CE]
      focus-visible:ring-[#A3A380]
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

/**
 * Input field with Sandesh styling
 */
export function Input({ 
  label,
  error,
  className = '',
  id,
  required,
  ...props 
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
          {label}
          {required && (
            <span className="text-[#C4756E] ml-1" aria-hidden="true" title="Required field">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-3.5 py-2.5 text-sm
          bg-white text-[#3D3D3D]
          border rounded-lg
          transition-all duration-150
          placeholder:text-[#8B8B8B]
          focus:outline-none focus:ring-2 focus:ring-[#A3A380]/20
          ${error 
            ? 'border-[#C4756E] focus:border-[#C4756E]' 
            : 'border-[#E5DCC0] focus:border-[#A3A380]'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[#C4756E]">{error}</p>
      )}
    </div>
  );
}

/**
 * Textarea with Sandesh styling
 */
export function Textarea({ 
  label,
  error,
  className = '',
  id,
  required,
  ...props 
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
          {label}
          {required && (
            <span className="text-[#C4756E] ml-1" aria-hidden="true" title="Required field">
              *
            </span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-3.5 py-2.5 text-sm
          bg-white text-[#3D3D3D]
          border rounded-lg resize-none
          transition-all duration-150
          placeholder:text-[#8B8B8B]
          focus:outline-none focus:ring-2 focus:ring-[#A3A380]/20
          ${error 
            ? 'border-[#C4756E] focus:border-[#C4756E]' 
            : 'border-[#E5DCC0] focus:border-[#A3A380]'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[#C4756E]">{error}</p>
      )}
    </div>
  );
}

/**
 * Loading skeleton component
 */
export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-24 w-full',
    button: 'h-10 w-24'
  };

  return (
    <div 
      className={`
        bg-gradient-to-r from-[#EFE8CE] via-[#E5DCC0] to-[#EFE8CE]
        bg-[length:200%_100%] animate-pulse rounded
        ${variants[variant]}
        ${className}
      `}
    />
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center animate-[fadeIn_300ms_ease] ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#BB8588]/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#BB8588]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B6B6B] max-w-sm mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button variant="accent" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Toast notification component
 */
export function Toast({ 
  message, 
  type = 'success', 
  onClose,
  className = ''
}) {
  const types = {
    success: {
      bg: 'bg-[#7A9B6D]',
      icon: '✓'
    },
    error: {
      bg: 'bg-[#C4756E]',
      icon: '✕'
    },
    warning: {
      bg: 'bg-[#D4A855]',
      icon: '!'
    }
  };

  const { bg, icon } = types[type];

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3 px-4 py-3
        ${bg} text-white rounded-lg shadow-lg
        animate-[slideUp_200ms_ease]
        ${className}
      `}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Badge component
 */
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#EFE8CE] text-[#6B6B6B]',
    primary: 'bg-[#A3A380] text-white',
    accent: 'bg-[#D7CE93] text-[#3D3D3D]',
    unread: 'bg-[#D8A48F] text-white'
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        px-2 py-0.5 text-xs font-medium rounded-full
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * Card component
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`
        bg-white rounded-xl
        border border-[#E5DCC0]
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-[#EFE8CE] bg-[#FDFCF7] rounded-t-xl ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Content
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Dropdown menu
 */
export function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div 
          className={`
            absolute z-50 mt-2 min-w-[180px]
            bg-white rounded-lg shadow-lg
            border border-[#E5DCC0]
            py-1 animate-[fadeIn_150ms_ease]
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {React.Children.map(children, child => 
            React.cloneElement(child, { 
              onClick: (e) => {
                child.props.onClick?.(e);
                setIsOpen(false);
              }
            })
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dropdown item
 */
export function DropdownItem({ children, icon: Icon, className = '', ...props }) {
  return (
    <button
      className={`
        w-full flex items-center gap-2.5 px-4 py-2
        text-sm text-[#3D3D3D] text-left
        hover:bg-[#EFE8CE] transition-colors
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-[#6B6B6B]" />}
      {children}
    </button>
  );
}

/**
 * Button for features that are coming soon.
 * Accessible implementation that is discoverable via keyboard but non-functional.
 */
export function ComingSoonButton({ icon: Icon, title, className = '' }) {
  return (
    <button
      className={`
        p-2 text-[#C0C0C0] cursor-not-allowed rounded-full
        hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3A380]/20
        ${className}
      `}
      title={title}
      aria-label={title}
      aria-disabled="true"
      onClick={(e) => e.preventDefault()}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
