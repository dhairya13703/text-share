import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6] animate-fade-in">
      {/* Header Skeleton */}
      <div className="bg-[#1a1a1a] p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-4 flex justify-between items-center">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;