import React from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailAuth: () => void;
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
}

const LoginModal: React.FC<LoginModalProps> = (props) => {
  const {
    isOpen, onClose, onGoogleLogin, onEmailAuth, isSignUp, setIsSignUp,
    authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword,
    onForgotPassword, authLoading
  } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isSignUp ? 'Create an Account' : 'Welcome Back!'}>
      <div className="flex flex-col gap-4 py-2">
        <button
          onClick={onGoogleLogin}
          className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
          <span className="text-xs text-gray-400 uppercase">OR</span>
          <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
        </div>

        {/* Email/Password Form */}
        <div className="flex flex-col gap-3">
          {isSignUp && (
            <div className="relative animate-fade-in">
              <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} className="peer w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 placeholder-transparent text-gray-800 dark:text-white bg-white dark:bg-gray-700" placeholder="Your Name" />
              <label className="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-1 text-xs text-indigo-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">Your Name</label>
            </div>
          )}

          <div className="relative">
            <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="peer w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 placeholder-transparent text-gray-800 dark:text-white bg-white dark:bg-gray-700" placeholder="Email" />
            <label className="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-1 text-xs text-indigo-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">Email</label>
          </div>

          <div className="relative">
            <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="peer w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 placeholder-transparent text-gray-800 dark:text-white bg-white dark:bg-gray-700" placeholder="Password" onKeyDown={e => e.key === 'Enter' && onEmailAuth()} />
            <label className="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-1 text-xs text-indigo-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">Password</label>
          </div>

          <button onClick={onEmailAuth} disabled={authLoading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex justify-center items-center">
            {authLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (isSignUp ? "Sign Up" : "Sign In")}
          </button>

          <div className="flex justify-between items-center text-sm">
            <button onClick={onForgotPassword} className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs">
              Forgot Password?
            </button>
            <div className="flex text-xs">
              <span className="text-gray-500 dark:text-gray-400 mr-1">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;