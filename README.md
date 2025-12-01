# Quick Notes

A personal note-taking app with cloud sync, offline support, and dark mode.

## Features

- 📝 Create, edit, delete notes
- 🏷️ Organize with categories
- ⚡ Quick action templates
- 🔍 Filter by category & date
- 🌙 Dark mode + 8 themes
- 🔐 Google & Email authentication
- ☁️ Real-time cloud sync
- 📱 Works offline
- 📲 Installable PWA
- 🔄 Undo/Redo
- 📤 Export/Import data

## Quick Start

### Prerequisites
- Node.js 16+
- Firebase account

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with Firebase credentials
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Run dev server
npm run dev
```

Visit `http://localhost:3000`

## Build & Deploy

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

Deploy to Vercel, Firebase Hosting, or Netlify.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- Firebase (Auth & Firestore)
- Vite
- PWA

## Project Structure

```
src/
├── components/     # React components
├── utils/         # Utility functions
├── types.ts       # Type definitions
├── constants.ts   # Constants
├── firebase.ts    # Firebase config
└── App.tsx        # Main app
```

## Notes

- All data stored in Firebase Firestore
- Offline data cached in localStorage
- Auto-syncs when back online
- No sensitive data stored locally

## License

MIT
