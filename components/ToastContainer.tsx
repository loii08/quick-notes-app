import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[2000] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto shadow-xl rounded-xl w-full flex items-start p-4 overflow-hidden relative
            ${toast.type === 'success' ? 'bg-green-500' : ''}
            ${toast.type === 'error' ? 'bg-red-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-500' : ''}
            ${toast.isClosing ? 'animate-fade-out-up' : 'animate-slide-up'}
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            {toast.type === 'success' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          {/* Message */}
          <div className="flex-grow text-white font-semibold text-sm pr-6">
            {toast.message}
          </div>
          {/* Close Button */}
          <button 
            onClick={() => onRemove(toast.id)}
            className="absolute top-2 right-2 p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {/* Progress Bar */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white/50"
            style={{ animation: `shrink-width 3000ms linear forwards` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;