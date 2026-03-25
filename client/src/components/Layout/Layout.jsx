import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, hideSidebar, fullWidth }) => {
  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${fullWidth ? 'h-screen overflow-hidden flex flex-col' : ''}`}>
      <Header />
      {fullWidth ? (
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      ) : (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {hideSidebar ? (
            <div className="w-full">
              {children}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="hidden lg:block lg:col-span-3 sticky top-20 self-start overflow-y-auto max-h-[calc(100vh-5rem)] custom-scrollbar">
                <Sidebar />
              </div>
              <div className="col-span-1 lg:col-span-9">
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