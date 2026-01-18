import React, { useState, useEffect } from 'react';
import Modal from '@shared/components/Modal';
import { User, updatePassword, EmailAuthProvider, reauthenticateWithCredential, linkWithCredential } from 'firebase/auth';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({ isOpen, onClose, user, onSuccess, onError }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hasPasswordProvider = user?.providerData.some(p => p.providerId === 'password');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSetPassword = async () => {
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (hasPasswordProvider) {
        // --- Change Password Logic ---
        if (!currentPassword) {
          setError("Please enter your current password.");
          setIsLoading(false);
          return;
        }
        if (user.email) {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
          onSuccess("Password changed successfully!");
        } else {
          throw new Error("User email is not available for re-authentication.");
        }
      } else {
        // --- Set Password Logic ---
        if (user.email) {
            const credential = EmailAuthProvider.credential(user.email, newPassword);
            await linkWithCredential(user, credential);
            onSuccess("Password set successfully! You can now sign in with your email and password.");
        } else {
            throw new Error("User email not found to link password.");
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError("Incorrect current password.");
      } else {
        setError("An error occurred. Please try again.");
      }
      onError(err.code === 'auth/wrong-password' ? "Incorrect current password." : "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  const title = hasPasswordProvider ? "Change Password" : "Set a Password";
  const buttonText = hasPasswordProvider ? "Change Password" : "Set Password";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {hasPasswordProvider && (
          <div>
            <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white" />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleSetPassword} disabled={isLoading} className="w-full py-3 bg-primary text-textOnPrimary font-bold rounded-xl hover:bg-primaryDark transition-colors mt-2 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-70">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default SetPasswordModal;
