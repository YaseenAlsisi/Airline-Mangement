import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col border-r border-slate-200 bg-white shadow-sm z-10">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};