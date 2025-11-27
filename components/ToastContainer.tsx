import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[2000] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-slide-up pointer-events-auto shadow-lg rounded-full px-6 py-3 text-sm font-semibold text-white flex items-center gap-2
            ${toast.type === 'success' ? 'bg-green-500' : ''}
            ${toast.type === 'error' ? 'bg-red-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-500' : ''}
          `}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.type === 'error' && (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;