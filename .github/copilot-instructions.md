# Quick Notes - AI Agent Instructions

## 🏗️ Architecture Overview

**Quick Notes** is a React 19 TypeScript PWA for note-taking with Firebase backend. The codebase follows strict architectural constraints with clear folder ownership:

- **app/**: Glue code only (routing, providers, global config)
- **features/<featureName>/**: Isolated features (auth, notes, admin)
- **shared/**: Generic, feature-agnostic code (components, utils, types, constants, firebase)
- **assets/**: Static assets and styles

## 🔧 Development Workflow

### Build & Run
```bash
npm run dev      # Vite dev server on :3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Firebase Setup
- Environment variables prefixed with `VITE_FIREBASE_*`
- Firestore with offline persistence (`persistentLocalCache`)
- Auth with Google provider + email/password
- Real-time listeners with `onSnapshot`

## 📋 Code Patterns

### Imports & Organization
```typescript
// ✅ Correct: Use absolute imports with architectural aliases
import { Note, Category } from '@shared/types';
import { TIMINGS, STORAGE_KEYS } from '@shared/constants';
import { formatTimeAgo } from '@shared/utils/dateUtils';
import { Modal, ToastContainer } from '@shared/components';
import { LoginModal, useAuthStatus } from '@features/auth';
import { NoteCard } from '@features/notes';
import { AdminDashboard } from '@features/admin';

// ❌ Forbidden: Relative imports across folders
import Note from '../../types';
import Button from '../../../shared/components/Button';
```

### State Management
```typescript
// ✅ Use centralized storage utilities
import { getStoredNotes, saveStoredNotes } from '@shared/utils/storageUtils';

// Firebase real-time sync pattern
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
    // Handle real-time updates
  });
  return unsubscribe;
}, []);
```

### Component Structure
```tsx
// ✅ Functional components with TypeScript
interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  // Component logic
};
```

### Feature Isolation
```typescript
// ✅ Features export public APIs only
// features/auth/index.ts
export { default as LoginModal } from './LoginModal';
export { default as SetPasswordModal } from './SetPasswordModal';
export { useAuthStatus } from './useAuthStatus';

// ✅ Import from feature public API
import { LoginModal, useAuthStatus } from '@features/auth';
```

### Styling Patterns
```tsx
// ✅ Tailwind with custom CSS variables and dark mode
<div className="bg-bgPage dark:bg-gray-900 text-textMain dark:text-white">
  <button className="bg-primary hover:bg-primaryDark text-textOnPrimary">
    Action
  </button>
</div>

// ✅ Use defined animations from tailwind.config.js
<div className="animate-fade-in animate-slide-up">
```

### Error Handling
```typescript
// ✅ Use centralized error messages
import { ERROR_MESSAGES, getAuthErrorMessage } from '@shared/utils/errorMessages';

try {
  await someOperation();
} catch (error) {
  showToast(getAuthErrorMessage(error), 'error');
}
```

### Validation & Sanitization
```typescript
// ✅ Always sanitize user inputs
import { sanitizeNoteContent, sanitizeCategoryName } from '@shared/utils/validationUtils';

const handleSaveNote = (content: string) => {
  const sanitized = sanitizeNoteContent(content);
  // Save sanitized content
};
```

## 🔐 Security & Data Handling

### Input Validation
- All user inputs must be sanitized using `@shared/utils/validationUtils`
- Email validation before auth operations
- Content sanitization for XSS prevention

### Firebase Security
- Firestore rules in `firestore.rules`
- Client-side validation + server-side security rules
- No sensitive data in localStorage

### Authentication Flow
```typescript
// Auth state management pattern
const { user, loading } = useAuthStatus();
if (loading) return <AppLoader />;
if (!user) return <LoginModal />;
```

## 🎨 UI/UX Patterns

### Toast Notifications
```tsx
// ✅ Use ToastContainer for all notifications
const [toasts, setToasts] = useState<ToastMessage[]>([]);

const showToast = (message: string, type: ToastType) => {
  const toast: ToastMessage = {
    id: generateId(),
    message,
    type,
    isClosing: false
  };
  setToasts(prev => [...prev, toast]);
};
```

### Modal System
```tsx
// ✅ Consistent modal API
<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Note"
  message="Are you sure you want to delete this note?"
  confirmText="Delete"
/>
```

### Loading States
```tsx
// ✅ Use AppLoader for initial load, SkeletonLoader for content
{loading ? <SkeletonLoader /> : <NoteList notes={notes} />}
```

## 📱 PWA Features

### Service Worker
- Auto-update registration via `vite-plugin-pwa`
- Offline note caching in localStorage
- Install prompts via `InstallButton` component

### Offline Support
```typescript
// ✅ Check online status for sync operations
const isOnline = navigator.onLine;
if (isOnline) {
  // Sync with Firebase
} else {
  // Save to localStorage only
}
```

## 🧪 Testing & Debugging

### Local Development
- Hot reload with Vite
- Firebase emulator for local testing
- Browser dev tools for PWA debugging

### Common Issues
- **Firebase config**: Check `.env.local` for `VITE_FIREBASE_*` variables
- **Path aliases**: Ensure `@shared/*`, `@features/*`, `@app/*` resolve correctly in IDE
- **TypeScript**: Check `@shared/types.ts` for interface definitions
- **Styling**: Verify Tailwind classes in `tailwind.config.js`

## 📂 Key Files Reference

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `src/app/App.tsx` | Main app logic, routing, state | Firebase listeners, auth flow |
| `src/shared/types.ts` | Type definitions | Note, Category, ToastMessage interfaces |
| `src/shared/constants.ts` | App constants | TIMINGS, STORAGE_KEYS, DEFAULTS |
| `src/shared/utils/storageUtils.ts` | localStorage helpers | Safe get/set with error handling |
| `src/shared/utils/validationUtils.ts` | Input validation | Sanitization functions |
| `src/shared/components/index.ts` | Component exports | Barrel export pattern |
| `tailwind.config.js` | Styling config | Custom colors, animations |
| `vite.config.ts` | Build config | PWA, path resolution |

## 🚀 Deployment

- **Vercel**: Recommended for React apps
- **Firebase Hosting**: For full Firebase integration
- **Netlify**: Alternative hosting option
- See `DEPLOYMENT.md` for detailed instructions

## 📚 Documentation

- `README.md`: Quick start and overview
- `IMPLEMENTATION_SUMMARY.md`: Architecture details
- `SECURITY.md`: Security practices
- `CONTRIBUTING.md`: Development guidelines