import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  closeOnBackdropClick?: boolean;
  titleId?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
  closeOnBackdropClick = true,
  titleId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // keep latest onClose in a ref so the effect below doesn't re-run
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Lock scroll and handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
      modalRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // If a guided tour is active, prevent closing via backdrop clicks so demo flow is controlled
    const tourActive = document && document.body && document.body.hasAttribute && document.body.hasAttribute('data-tour-open');
    if (tourActive) return;
    if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-10 px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal Content */}
      <div
        className={`relative bg-surface dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[85vh] animate-slide-up overflow-hidden border border-borderLight dark:border-gray-700`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-primary">
            <h2 id={titleId || 'modal-title'} className="text-xl font-bold text-textOnPrimary">
              {title}
            </h2>
          <button
            onClick={onClose}
            className="p-2 text-textOnPrimary/70 hover:text-textOnPrimary hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-textOnPrimary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar text-gray-700 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
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
