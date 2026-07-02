'use client';

import { useEffect } from 'react';
// Components
import { CircleCheckIcon, CircleXIcon } from '@/components/Icons';

type ToastProps = {
  message: string
  type?: 'success' | 'error'
  onDismiss?: () => void
  duration?: number
  action?: { label: string, onClick: () => void }
};

export const Toast: React.FC<ToastProps> = (props) => {
  const { message, type = 'success', onDismiss, duration = 4000, action } = props;
  useEffect(() => {
    if (!onDismiss) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const styles
    = type === 'error'
      ? 'bg-danger-50 border border-danger-100 text-danger-700'
      : 'bg-success-50 border border-success-100 text-success-700';

  const icon
    = type === 'error'
      ? <CircleXIcon className="w-4 h-4 shrink-0" />
      : <CircleCheckIcon className="w-4 h-4 shrink-0" />;

  return (
    <div className="fixed bottom-6 right-6 z-50 toast-enter">
      <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-lg ${styles}`}>
        {icon}
        <span>{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-1 underline font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
