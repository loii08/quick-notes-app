import React, { useState, useEffect } from 'react';

const AppPreview: React.FC = () => {
  const [desktopNoteIndex, setDesktopNoteIndex] = useState(0);
  const [showDesktopNewNote, setShowDesktopNewNote] = useState(false);
  const [showDesktopToast, setShowDesktopToast] = useState(false);

  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showMobileToast, setShowMobileToast] = useState(false);

  // Desktop animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setShowDesktopNewNote(true);
      setTimeout(() => {
        setShowDesktopNewNote(false);
        setShowDesktopToast(true);
        setTimeout(() => setShowDesktopToast(false), 1500);
        setDesktopNoteIndex(prev => prev + 1);
      }, 1000);
    }, 3000); // every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Mobile animation loop (FAB click simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowMobileModal(true);
      setTimeout(() => {
        setShowMobileModal(false);
        setShowMobileToast(true);
        setTimeout(() => setShowMobileToast(false), 1500);
      }, 1200); // modal display duration
    }, 4000); // every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[420px] md:h-[480px] flex items-center justify-center -mt-4 md:-mt-8">
      
      {/* Desktop View */}
      <div className="relative w-full scale-[0.9] animate-desktop-view-demo">
        <div className="relative aspect-[16/10] bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden">
          {/* Header */}
          <div className="h-12 bg-green-50 border-b border-green-200 flex items-center px-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 space-y-4 relative">
            {/* Existing Notes */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 bg-white rounded-lg shadow-sm border border-green-200 p-3 space-y-2">
                <div className="h-3 w-3/4 bg-green-100 rounded-md"></div>
                <div className="h-3 w-1/2 bg-green-100 rounded-md"></div>
              </div>
            ))}

            {/* Animated New Note */}
            {showDesktopNewNote && (
              <div className="h-12 bg-green-50 rounded-lg shadow-inner border border-green-200 p-3 space-y-2 absolute left-0 right-0 transform transition-transform duration-500 -translate-y-16 opacity-0 animate-slide-down">
                <div className="h-3 w-3/4 bg-green-100 rounded-md animate-pulse"></div>
                <div className="h-3 w-1/2 bg-green-100 rounded-md animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Toast */}
        {showDesktopToast && (
          <div className="absolute top-16 right-6 w-48 p-3 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Note Added!</span>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="absolute w-48 h-96 bg-green-50 rounded-3xl p-2 shadow-2xl border-4 border-green-200 animate-mobile-view-demo origin-center scale-[0.9]">
        <div className="w-full h-full rounded-2xl overflow-hidden p-3 relative">
          {/* Header */}
          <div className="h-4 w-1/3 bg-green-100 rounded-md mb-4"></div>

          {/* Notes */}
          <div className="space-y-2 relative">
            <div className="h-10 bg-white rounded-lg shadow-sm border border-green-200 p-2 space-y-1.5">
              <div className="h-2 w-3/4 bg-green-100 rounded-md"></div>
              <div className="h-2 w-1/2 bg-green-100 rounded-md"></div>
            </div>

            {/* Modal simulation */}
            {showMobileModal && (
              <div className="absolute left-0 right-0 top-4 bg-white rounded-xl border border-green-200 shadow-lg p-3 animate-slide-down z-10">
                <div className="h-3 w-3/4 bg-green-100 rounded-md animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-green-100 rounded-md animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Mobile FAB */}
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer z-20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>

          {/* Mobile Toast */}
          {showMobileToast && (
            <div className="absolute top-4 right-4 w-40 p-2 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Note Added!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppPreview;
