import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-blue-600 mb-2">facebook</h2>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 