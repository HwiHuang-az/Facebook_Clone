import React from 'react';

const PostSkeleton = () => (
  <div className="bg-white rounded-lg shadow-facebook mb-4 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="p-4 flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-36" />
        <div className="h-2.5 bg-gray-200 rounded w-20" />
      </div>
    </div>

    {/* Content */}
    <div className="px-4 pb-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-3/5" />
    </div>

    {/* Image placeholder */}
    <div className="w-full h-64 bg-gray-200" />

    {/* Stats */}
    <div className="px-4 py-2 flex items-center justify-between">
      <div className="h-3 bg-gray-200 rounded w-16" />
      <div className="h-3 bg-gray-200 rounded w-24" />
    </div>

    {/* Action buttons */}
    <div className="px-4 border-t border-gray-100 mx-1">
      <div className="flex justify-between py-3">
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-12 mx-auto" />
      </div>
    </div>
  </div>
);

export default PostSkeleton;
