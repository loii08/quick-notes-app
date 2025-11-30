import React, { createContext, useContext, useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPWAContextType {
  canInstall: boolean;
  showInstallPrompt: () => void;
}

const InstallPWAContext = createContext<InstallPWAContextType | undefined>(undefined);

export const InstallPWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    // We can only use the prompt once, so clear it.
    setDeferredPrompt(null);
  };

  return (
    <InstallPWAContext.Provider value={{ canInstall: !!deferredPrompt, showInstallPrompt }}>
      {children}
    </InstallPWAContext.Provider>
  );
};

export const useInstallPWA = () => {
  const context = useContext(InstallPWAContext);
  if (context === undefined) {
    throw new Error('useInstallPWA must be used within an InstallPWAProvider');
  }
  return context;
};