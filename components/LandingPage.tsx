import React from 'react';
import AppPreview from './AppPreview';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-textMain dark:text-gray-100 p-4 pt-20">
      <div className="text-center max-w-2xl animate-fade-in">
        <img src="/icon.ico" alt="App Icon" className="w-24 h-24 mx-auto mb-6 rounded-full shadow-lg" />
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary dark:text-white">
          Quick Notes
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
          Capture ideas instantly. Your thoughts, synced everywhere.
        </p>
        <div className="mt-10">
          <button
            onClick={onLoginClick}
            className="px-8 py-4 bg-primary text-textOnPrimary dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 animate-pulse-slow"
          >
            Get Started
          </button>
        </div>
      </div>
      <AppPreview />
    </div>
  );
};

export default LandingPage;