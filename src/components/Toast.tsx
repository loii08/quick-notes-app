import React, { useEffect, useState, useCallback } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

// Fixed color classes with proper dark mode contrast
const BACKGROUND_COLORS = {
  success: 'bg-green-50 dark:bg-green-950',
  error: 'bg-red-50 dark:bg-red-950',
  info: 'bg-blue-50 dark:bg-blue-950',
  warning: 'bg-yellow-50 dark:bg-yellow-950',
};

const BORDER_COLORS = {
  success: 'border-green-500 dark:border-green-400',
  error: 'border-red-500 dark:border-red-400',
  info: 'border-blue-500 dark:border-blue-400',
  warning: 'border-yellow-500 dark:border-yellow-400',
};

const TEXT_COLORS = {
  success: 'text-green-800 dark:text-green-100',
  error: 'text-red-800 dark:text-red-100',
  info: 'text-blue-800 dark:text-blue-100',
  warning: 'text-yellow-800 dark:text-yellow-100',
};

const ICON_COLORS = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
};

const PROGRESS_COLORS = {
  success: 'bg-green-500 dark:bg-green-400',
  error: 'bg-red-500 dark:bg-red-400',
  info: 'bg-blue-500 dark:bg-blue-400',
  warning: 'bg-yellow-500 dark:bg-yellow-400',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation to complete before removing
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  }, [toast.id, onRemove]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Auto-dismiss functionality
  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return;

    const totalTime = toast.duration;
    const intervalTime = 50;
    const decrement = (intervalTime / totalTime) * 100;

    const interval = setInterval(() => {
      if (!isPaused && !isExiting) {
        setProgress(prev => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            clearInterval(interval);
            handleRemove();
            return 0;
          }
          return newProgress;
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [toast.duration, isPaused, isExiting, handleRemove]);

  // Handle manual close from parent
  useEffect(() => {
    if (toast.isClosing && !isExiting) {
      handleRemove();
    }
  }, [toast.isClosing, isExiting, handleRemove]);

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const animationClass = isExiting 
    ? 'opacity-0 scale-95 -translate-y-2' 
    : isVisible 
    ? 'opacity-100 scale-100 translate-y-0' 
    : 'opacity-0 scale-95 -translate-y-2';

  return (
    <div
      className={`
        w-full max-w-sm
        transition-all duration-300 ease-out
        ${animationClass}
        transform
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`
          relative flex items-start p-4 rounded-xl shadow-lg
          border-l-4
          ${BACKGROUND_COLORS[toast.type]}
          ${BORDER_COLORS[toast.type]}
          ${TEXT_COLORS[toast.type]}
          transition-all duration-200
          hover:shadow-xl
          backdrop-blur-sm
          dark:backdrop-blur-md
        `}
      >
        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && (
          <div
            className={`absolute top-0 left-0 h-1 transition-all duration-50 ease-linear rounded-t-xl ${PROGRESS_COLORS[toast.type]}`}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`}>
          {ICONS[toast.type]}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium leading-5 break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-3 p-1 rounded-full 
                   text-gray-500 hover:text-gray-700 
                   dark:text-gray-300 dark:hover:text-gray-100
                   hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50
                   dark:focus:ring-gray-300"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;