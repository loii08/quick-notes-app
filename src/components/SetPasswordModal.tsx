import React, { useState } from 'react';
import Modal from './Modal';
import { User, EmailAuthProvider, linkWithCredential } from 'firebase/auth';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  onError,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSetPassword = async () => {
    // Validation
    if (!password || !confirmPassword) {
      onError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      onError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      onError('Passwords do not match');
      return;
    }

    if (!user || !user.email) {
      onError('User email not found');
      return;
    }

    setIsLoading(true);

    try {
      // Create credential with user's email and new password
      const credential = EmailAuthProvider.credential(user.email, password);

      // Link the credential to the user's account
      await linkWithCredential(user, credential);

      onSuccess('Password set successfully! You can now login with your email and password.');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error: any) {
      console.error('Error setting password:', error);

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        onError('This email is already associated with another account');
      } else if (error.code === 'auth/credential-already-in-use') {
        onError('A password is already set for this account');
      } else if (error.code === 'auth/weak-password') {
        onError('Password is too weak. Please use a stronger password');
      } else {
        onError(error.message || 'Failed to set password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Set Password"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set a password to enable login with your email. You'll be able to login using either Google or your email and password.
        </p>

        <div>
          <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 6 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            disabled={isLoading}
            className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-borderLight dark:border-gray-600 rounded-xl text-textMain dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSetPassword}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primaryDark text-textOnPrimary font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting...
              </>
            ) : (
              'Set Password'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SetPasswordModal;
