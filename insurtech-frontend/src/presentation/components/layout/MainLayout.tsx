import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="ml-[260px] transition-all duration-300">
        <div className="p-6 lg:p-8 max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
