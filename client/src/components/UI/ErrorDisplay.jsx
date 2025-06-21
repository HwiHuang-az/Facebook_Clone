import React from 'react';

const ErrorDisplay = ({ errors, className = '' }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-facebook p-3 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-400 text-lg">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Có lỗi xảy ra:' : 'Có một số lỗi cần sửa:'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {errors.length === 1 ? (
              <p>{errors[0]}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 