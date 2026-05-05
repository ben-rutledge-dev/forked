'use client';

import { useEffect } from 'react';

type Props = {
  message: string
  type?: 'success' | 'error'
  onDismiss?: () => void
  duration?: number
};

export const Toast = ({ message, type = 'success', onDismiss, duration = 4000 }: Props) => {
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
      ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
        )
      : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        );

  return (
    <div className="fixed bottom-6 right-6 z-50 toast-enter">
      <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-lg ${styles}`}>
        {icon}
        {message}
      </div>
    </div>
  );
};
