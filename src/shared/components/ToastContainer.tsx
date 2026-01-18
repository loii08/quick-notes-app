import React from 'react';
import { ToastMessage } from '@shared/types';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[9999] flex flex-col items-center gap-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;