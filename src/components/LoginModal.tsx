import React, { useEffect, useRef, useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailAuth: () => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  authName: string;
  setAuthName: (name: string) => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (password: string) => void;
  onForgotPassword: () => void;
  authLoading: boolean;
  authLoadingSource?: 'google' | 'email' | null;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen, onClose, onGoogleLogin, onEmailAuth, rememberMe, setRememberMe, isSignUp, setIsSignUp,
  authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword,
  onForgotPassword, authLoading, authLoadingSource
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Effect for focus management and escape key
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);

      return () => {
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Effect for scroll lock and restoring focus on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus(); // Set focus only when modal opens
      return () => {
        document.body.style.overflow = 'unset';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md flex flex-col gap-6 p-4 md:p-8 bg-white dark:bg-gray-50 rounded-2xl shadow-xl relative outline-none"
      >
        <div className="flex justify-between items-center pb-2 border-b border-green-100">
          <h2 id="modal-title" className="text-xl font-bold text-green-800">{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Google Login */}
          <button
            onClick={onGoogleLogin}
            disabled={authLoading}
            aria-disabled={authLoading}
            aria-label="Continue with Google"
            className={`relative overflow-hidden group w-full py-3 ${authLoading && authLoadingSource === 'google' ? 'bg-green-200 text-green-400 cursor-not-allowed' : authLoading ? 'bg-green-100 text-green-500 cursor-not-allowed' : 'bg-green-50 text-green-700'} font-semibold rounded-xl flex items-center justify-center gap-3 border border-green-200 shadow-sm hover:!bg-green-500 hover:!text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400`}
          >
            <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-white/30 transform -skew-x-12 transition-all duration-500 group-hover:left-[125%] pointer-events-none"></span>
            <svg className="relative w-5 h-5 z-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span className="relative z-10">Continue with Google</span>
            {authLoading && authLoadingSource === 'google' && (
              <svg className="animate-spin absolute right-3 w-4 h-4 text-green-700" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px bg-green-100 flex-1"></div>
            <span className="text-xs text-green-300 uppercase">OR</span>
            <div className="h-px bg-green-100 flex-1"></div>
          </div>

          {/* Email/Password Form */}
          <div className="flex flex-col gap-4">
            {isSignUp && (
              <div className="relative animate-fade-in">
                <input
                  type="text"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="Your Name"
                  className="peer w-full p-4 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-transparent text-gray-800 bg-green-50"
                />
                <label className="absolute left-4 -top-2.5 bg-green-50 px-1 text-sm text-green-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-green-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-700">
                  Your Name
                </label>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="Email"
                className="peer w-full p-4 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-transparent text-gray-800 bg-green-50"
              />
              <label className="absolute left-4 -top-2.5 bg-green-50 px-1 text-sm text-green-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-green-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-700">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={e => e.key === 'Enter' && onEmailAuth()}
                aria-label="Password"
                className="peer w-full pr-10 p-4 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-transparent text-gray-800 bg-green-50"
              />
              <label className="absolute left-4 -top-2.5 bg-green-50 px-1 text-sm text-green-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-green-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.26 0 2.47.233 3.59.657M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            {/* Sign In / Sign Up Button */}
            {(() => {
              const canSubmit = isSignUp ? authName.trim() && authEmail.trim() && authPassword.trim() : authEmail.trim() && authPassword.trim();
              return (
                <button
                  onClick={onEmailAuth}
                  disabled={authLoading || !canSubmit}
                  aria-disabled={authLoading || !canSubmit}
                  className={`relative overflow-hidden group w-full py-3 ${authLoading && authLoadingSource === 'email' ? 'bg-green-700 text-white' : authLoading ? 'bg-green-400 text-white/50 cursor-not-allowed' : !canSubmit ? 'bg-green-300 text-white/60 cursor-not-allowed' : 'bg-green-600 text-white'} font-bold rounded-xl shadow-lg flex justify-center items-center transition-all duration-300 hover:!bg-green-700`}
                >
                  <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-white/20 transform -skew-x-12 transition-all duration-500 group-hover:left-[125%] pointer-events-none"></span>
                  {authLoading && authLoadingSource === 'email' ? (
                    <svg className="animate-spin h-5 w-5 text-white relative z-10" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : (
                    <span className="relative z-10">{isSignUp ? "Sign Up" : "Sign In"}</span>
                  )}
                </button>
              );
            })()}

            {/* Footer Options */}
            <div className="flex flex-col gap-3 text-xs">
              {/* Show Remember me only on Sign In (not on Sign Up) */}
              {!isSignUp && (
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="mr-2" />
                  <span>Remember me</span>
                </label>
              )}
              <div className="flex justify-between items-center">
                <button onClick={onForgotPassword} className="text-green-600 hover:text-green-800">
                  Forgot Password?
                </button>
                <div className="flex text-xs">
                  <span className="text-gray-500 mr-1">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
                  <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-green-700 hover:underline">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
