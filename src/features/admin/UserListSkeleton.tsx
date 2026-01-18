import React from 'react';
import './skeleton.css'; // We'll define shimmer animation in this CSS file

const SkeletonRow = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
      <div className="skeleton h-3 w-1/2 rounded"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="skeleton h-6 w-16 rounded-full"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="skeleton h-6 w-16 rounded-full"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="skeleton h-4 w-24 rounded"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap flex gap-4">
      <div className="skeleton h-4 w-12 rounded"></div>
      <div className="skeleton h-4 w-12 rounded"></div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="skeleton-card p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-start">
      <div>
        <div className="skeleton h-5 w-32 rounded mb-2"></div>
        <div className="skeleton h-4 w-48 rounded"></div>
      </div>
      <div className="skeleton h-6 w-16 rounded-full"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div className="skeleton h-4 w-full rounded mb-2"></div>
      <div className="skeleton h-4 w-full rounded"></div>
    </div>
  </div>
);

const UserListSkeleton: React.FC = () => (
  <>
    {/* Desktop Skeleton */}
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
    {/* Mobile Skeleton */}
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </>
);

export default UserListSkeleton;
