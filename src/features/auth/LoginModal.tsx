import React, { useState, useEffect } from 'react';
import Modal from '@shared/components/Modal';
import InputWithIcon from '@shared/components/InputWithIcon';
import { Eye, EyeOff } from 'lucide-react';
import { isValidEmail } from '@shared/utils/validationUtils';
import { ERROR_MESSAGES } from '@shared/utils/errorMessages';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailAuth: () => void;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  authName: string;
  setAuthName: (value: string) => void;
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  onForgotPassword: () => void;
  authLoading: boolean;
  authLoadingSource: 'google' | 'email' | null;
  allowRegistration?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onEmailAuth,
  rememberMe,
  setRememberMe,
  isSignUp,
  setIsSignUp,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  onForgotPassword,
  authLoading,
  authLoadingSource,
  allowRegistration = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showRegistrationDisabledModal, setShowRegistrationDisabledModal] = useState(false);

  // Clear password after modal closes for security
  useEffect(() => {
    if (!isOpen) {
      // Password will be cleared by parent component
      setShowPassword(false);
      setEmailError('');
    }
  }, [isOpen]);

  const handleEmailChange = (email: string) => {
    setAuthEmail(email);
    // Validate email in real-time
    if (email && !isValidEmail(email)) {
      setEmailError(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    } else {
      setEmailError('');
    }
  };

  const handleSignUpClick = () => {
    if (!allowRegistration) {
      setShowRegistrationDisabledModal(true);
    } else {
      setIsSignUp(!isSignUp);
    }
  };

  const isEmailValid = !authEmail || isValidEmail(authEmail);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isSignUp ? "Create Account" : "Sign In"}>
        <div className="flex flex-col gap-4">
          <button
            onClick={onGoogleLogin}
            disabled={authLoading}
            className="w-full py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl border border-borderLight dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-3"
          >
            {authLoading && authLoadingSource === 'google' ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-borderLight dark:border-gray-700" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-borderLight dark:border-gray-700" />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your Name" className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              value={authEmail} 
              onChange={(e) => handleEmailChange(e.target.value)} 
              placeholder="Email Address" 
              className={`w-full p-3 border rounded-xl focus:outline-none text-sm bg-bgPage dark:bg-gray-700 dark:text-white transition-colors ${
                emailError 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-borderLight dark:border-gray-600 focus:border-primary'
              }`}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <InputWithIcon
              type={showPassword ? 'text' : 'password'}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Password"
              icon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              onIconClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              Remember me
            </label>
            {!isSignUp && (
              <button onClick={onForgotPassword} className="text-sm text-primary hover:underline">Forgot password?</button>
            )}
          </div>

          <button
            onClick={onEmailAuth}
            disabled={authLoading}
            className="w-full py-3 bg-primary text-textOnPrimary font-bold rounded-xl hover:bg-primaryDark transition-colors flex items-center justify-center"
          >
            {authLoading && authLoadingSource === 'email' ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={handleSignUpClick} 
              className="font-semibold text-primary hover:underline ml-1"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </Modal>

      {/* Registration Disabled Modal */}
      <Modal 
        isOpen={showRegistrationDisabledModal} 
        onClose={() => setShowRegistrationDisabledModal(false)} 
        title="Registration Disabled"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 5v1m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          
          <p className="text-center text-gray-700 dark:text-gray-300 text-base">
            New registrations are currently not available. Please contact the system administrator for more information.
          </p>
          
          <button
            onClick={() => setShowRegistrationDisabledModal(false)}
            className="w-full py-3 bg-primary text-textOnPrimary font-bold rounded-xl hover:bg-primaryDark transition-colors"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
};

export default LoginModal;