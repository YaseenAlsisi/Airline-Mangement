import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      <div className="hidden lg:fixed lg:inset-y-0 start-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>
      <div className="lg:ps-72 flex flex-col flex-1 w-full min-h-screen max-w-full">
        <Header />
        <main className="flex-1 p-4 lg:p-6 lg:pt-2 flex flex-col">
          <div className="bg-white rounded-[32px] shadow-sm flex-1 overflow-hidden relative border border-gray-100">
            <div className="h-full overflow-y-auto p-6 lg:p-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};