import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, hideSidebar }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {hideSidebar ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout; 