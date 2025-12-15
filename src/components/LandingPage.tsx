import React from 'react';
import AppPreview from './AppPreview';
import KeyFeatures from './KeyFeatures';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-gray-900 dark:text-gray-100 p-4 pt-12 md:pt-20 bg-green-50 dark:bg-gray-900 min-h-screen">
      
      <div className="text-center w-full max-w-4xl animate-fade-in">
        {/* App Preview */}
        <AppPreview />

        {/* Hero Text */}
        <h1 className="mt-12 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          Capture Ideas Instantly
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300">
          Your thoughts, synced everywhere. Organize, manage, and access your ideas effortlessly.
        </p>

        {/* Call-to-Action */}
        <div className="mt-10">
          <button
            onClick={onLoginClick}
            className="relative overflow-hidden group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-white/20 transform -skew-x-12 transition-all duration-500 group-hover:left-[125%] pointer-events-none"></span>
            <span className="relative z-10">Get Started</span>
          </button>
        </div>

        {/* Key Features */}
        <KeyFeatures />
      </div>
    </div>
  );
};

export default LandingPage;
