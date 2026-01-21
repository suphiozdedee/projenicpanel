import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main Content - Offset by Sidebar Width */}
      <div className="flex-1 pl-72 transition-all duration-300">
        <main className="min-h-screen p-8 bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}