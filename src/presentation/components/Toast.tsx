'use client';

import { useEffect, useState, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

function Toast({ id, message, type, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto close after 3s with progress
  useEffect(() => {
    const duration = 3000;
    const interval = 20;
    const decrement = (interval / duration) * 100;
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(progressIntervalRef.current!);
          return 0;
        }
        return next;
      });
    }, interval);
    
    timerRef.current = setTimeout(() => {
      setExiting(true);
    }, duration);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [id]);

  // Remove after exit animation
  useEffect(() => {
    if (exiting) {
      exitTimerRef.current = setTimeout(() => {
        onClose(id);
      }, 250); // match slide-out duration
    }
  }, [exiting, id, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderLeft: 'border-l-emerald-500',
          iconGradient: 'from-emerald-500 to-teal-500',
          progressBg: 'bg-emerald-500',
          iconText: 'text-emerald-500'
        };
      case 'error':
        return {
          borderLeft: 'border-l-red-500',
          iconGradient: 'from-red-500 to-rose-500',
          progressBg: 'bg-red-500',
          iconText: 'text-red-500'
        };
      case 'warning':
        return {
          borderLeft: 'border-l-amber-500',
          iconGradient: 'from-amber-500 to-orange-500',
          progressBg: 'bg-amber-500',
          iconText: 'text-amber-500'
        };
      case 'info':
        return {
          borderLeft: 'border-l-blue-500',
          iconGradient: 'from-blue-500 to-indigo-500',
          progressBg: 'bg-blue-500',
          iconText: 'text-blue-500'
        };
      default:
        return {
          borderLeft: 'border-l-slate-500',
          iconGradient: 'from-slate-500 to-gray-500',
          progressBg: 'bg-slate-500',
          iconText: 'text-slate-500'
        };
    }
  };

  const styles = getToastStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={
        `relative overflow-hidden w-[380px] h-[72px] flex-shrink-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg border-l-4 ${styles.borderLeft} shadow-lg transition-all duration-300 ` +
        (exiting ? 'animate-slide-out' : 'animate-slide-in')
      }
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div className="flex items-center gap-3 p-4 h-full w-full">
        {/* Icon - emoji without background */}
        <div className="flex-shrink-0 w-8 h-full flex items-center justify-center">
          <span className="text-3xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji, sans-serif' }}>{getIcon()}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 h-full flex items-center">
          <p className="font-medium text-slate-800 dark:text-slate-100 text-[15px] break-words leading-relaxed tracking-wide w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif', wordBreak: 'break-word' }}>{message}</p>
        </div>
        {/* Close button */}
        <button
          onClick={() => setExiting(true)}
          className="flex-shrink-0 h-full flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200"
          aria-label="ปิดแจ้งเตือน"
          tabIndex={0}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-700">
        <div 
          className={`h-full ${styles.progressBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default Toast;
