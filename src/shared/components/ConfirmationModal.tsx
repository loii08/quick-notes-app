import React, { useState } from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  disableConfirm?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error';
  disabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  disableConfirm = false,
  disabled = false,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose(); // Close only on success
    } catch (error) {
      // The error is caught, but we don't close the modal,
      // allowing the parent component to display an error state.
      console.error("Confirmation action failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-lg">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10 dark:bg-indigo-900/30'}`}>
          {isDestructive ? (
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-grow">
          <div className="text-gray-600 dark:text-gray-300 text-base">{message}</div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <button 
          onClick={onClose}
          className="px-5 py-2 bg-white dark:bg-gray-700 border border-borderLight dark:border-gray-600 text-textMain dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isConfirming}
        >
          {cancelText}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleConfirm();
          }}
          disabled={disabled || disableConfirm || isConfirming}
          className={`px-5 py-2 text-white rounded-lg font-semibold shadow-sm transition-all active:scale-95 text-sm w-28 flex items-center justify-center ${
            isDestructive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-primary hover:bg-primaryDark dark:bg-indigo-600 dark:hover:bg-indigo-700'
          } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 dark:disabled:bg-gray-600`}
        >
          {isConfirming || disabled ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
