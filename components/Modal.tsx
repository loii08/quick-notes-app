import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'max-w-md' 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-10 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-surface dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[85vh] animate-slide-up overflow-hidden border border-borderLight dark:border-gray-700`}>
        <div className="flex items-center justify-between p-5 border-b border-borderLight dark:border-gray-700">
          <h3 className="text-xl font-bold text-textMain dark:text-gray-100">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-textMain dark:hover:text-gray-200 hover:bg-bgPage dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar text-gray-700 dark:text-gray-300">
          {children}
        </div>

        {footer && (
          <div className="p-5 bg-bgPage dark:bg-gray-900 border-t border-borderLight dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;