// Auth Feature Public API
export { default as LoginModal } from './LoginModal';
export { default as SetPasswordModal } from './SetPasswordModal';
export { useAuthStatus } from './useAuthStatus';

// Re-export types that might be needed
export type { User } from 'firebase/auth';