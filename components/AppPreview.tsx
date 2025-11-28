import React from 'react';

const AppPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-3xl mx-auto mt-20 mb-10">
      {/* Main App Window */}
      <div className="relative aspect-[16/10] bg-surface dark:bg-gray-800 rounded-2xl shadow-2xl border border-borderLight dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-bgPage dark:bg-gray-900/50 border-b border-borderLight dark:border-gray-700 flex items-center px-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          </div>
        </div>

        {/* App Content */}
        <div className="p-6">
          {/* Input Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-borderLight dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-typing-demo"></div>
          </div>

          {/* Note Group */}
          <div className="mt-6">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
            <div className="space-y-3">
              {/* New note that appears */}
              <div className="h-12 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-borderLight dark:border-gray-700 p-3 space-y-2 animate-note-appear-demo">
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              {/* Static placeholder note */}
              <div className="h-12 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-borderLight dark:border-gray-700 p-3 space-y-2">
                <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-600 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <div 
        className="absolute top-16 right-4 md:right-10 w-48 p-3 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 animate-toast-demo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        <span>Note Added!</span>
      </div>
    </div>
  );
};

export default AppPreview;