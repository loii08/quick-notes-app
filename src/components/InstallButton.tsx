import React from 'react';
import { useInstallPWA } from '@/InstallPWAContext';
import { Download } from 'lucide-react';

const isIos = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => {
    if (typeof window === 'undefined' || !window.navigator) return false;
    // The 'standalone' property is a non-standard API supported by Safari on iOS
    return ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);
};

export const InstallButton = () => {
  const { canInstall, showInstallPrompt } = useInstallPWA();

  const handleIosInstall = () => {
    alert('To install, tap the Share button and then "Add to Home Screen".');
  };

  // Don't show the button if the app is already running in standalone mode
  if (isInStandaloneMode()) {
    return null;
  }

  // Always show an install option on iOS (since we can't detect installability)
  if (isIos()) {
    return (
      <button onClick={handleIosInstall} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-textMain dark:text-gray-200 flex items-center gap-2">
        <Download className="w-4 h-4 text-gray-400" />
        Install App
      </button>
    );
  }

  // For other browsers, only show if the `beforeinstallprompt` event was fired
  if (canInstall) {
    return (
      <button onClick={showInstallPrompt} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-textMain dark:text-gray-200 flex items-center gap-2">
        <Download className="w-4 h-4 text-gray-400" />
        Install App
      </button>
    );
  }

  return null;
};