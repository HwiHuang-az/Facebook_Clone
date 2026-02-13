import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, hideSidebar, fullWidth }) => {
  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${fullWidth ? 'h-screen overflow-hidden flex flex-col' : ''}`}>
      <Header />
      {fullWidth ? (
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
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
      )}
    </div>
  );
};

export default Layout; 