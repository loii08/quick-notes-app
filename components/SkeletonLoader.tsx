import React from 'react';

const SkeletonNoteGroup: React.FC = () => (
  <div className="mb-8 bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border border-borderLight dark:border-gray-700 overflow-hidden">
    {/* Header */}
    <div className="bg-bgPage dark:bg-gray-900/50 px-5 py-4 border-b border-borderLight dark:border-gray-700 flex items-center justify-between">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
    </div>
    {/* Note Skeletons */}
    <div className="divide-y divide-borderLight dark:divide-gray-700">
      {[1, 2].map(i => (
        <div key={i} className="px-5 py-4">
          <div className="flex justify-between items-center mb-2.5">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Skeleton for Category Bar */}
      <div className="z-30 flex items-center mb-8 p-1.5 rounded-full border border-borderLight/50 shadow-sm h-[52px]">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>

      {/* Skeleton for Desktop Input */}
      <div className="hidden md:block bg-surface dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-borderLight dark:border-gray-700 mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 h-16 bg-bgPage dark:bg-gray-900 rounded-xl"></div>
          <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton for Note Groups */}
      <div className="animate-fade-in pb-10">
        <SkeletonNoteGroup />
        <SkeletonNoteGroup />
      </div>
    </div>
  );
};

export default SkeletonLoader;