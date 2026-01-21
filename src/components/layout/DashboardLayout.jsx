
import React, { useState, memo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Search, LogOut, X } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Input } from '@/components/ui/input';
import NotificationCenter from '@/components/NotificationCenter';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import ConnectionStatus from '@/components/ConnectionStatus';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Memoized Components to prevent unnecessary re-renders
const MemoizedSidebar = memo(Sidebar);
const MemoizedNotificationCenter = memo(NotificationCenter);

const DashboardLayout = () => {
  const { user, logout } = useSimpleAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#030303] flex overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-200">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
              <div 
                  className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
                  onClick={closeSidebar}
              />
          )}

          {/* Sidebar */}
          <div className={cn(
              "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out border-r border-white/5 bg-[#050505]",
              // Mobile: Slide in/out
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              // Tablet (sm): Compact static sidebar
              "sm:translate-x-0 sm:static sm:block",
               "w-[260px] sm:w-auto" 
          )}>
               {/* Close button for mobile only */}
               <div className="absolute top-4 right-4 sm:hidden z-50">
                  <Button variant="ghost" size="icon" onClick={closeSidebar} className="text-zinc-400">
                      <X className="w-5 h-5" />
                  </Button>
               </div>
              <MemoizedSidebar />
          </div>

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
              {/* Top Header */}
              <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 relative w-full">
                  {/* Tech Gradient Line at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                  
                  <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="sm:hidden text-gray-400 hover:text-white hover:bg-white/5 -ml-2" 
                              onClick={toggleSidebar}
                          >
                              <Menu className="w-5 h-5" />
                          </Button>

                          {/* Search Input */}
                          <div className="flex items-center relative w-full max-w-[200px] sm:max-w-xs group/search">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-orange-500 transition-colors" />
                               <Input 
                                  placeholder="Ara..." 
                                  className="pl-9 sm:pl-10 h-9 sm:h-10 bg-[#121212]/50 border-white/5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-orange-500/40 focus:bg-[#161616] focus:ring-0 rounded-xl transition-all duration-300 hover:border-white/10 w-full" 
                               />
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-4">
                          <ConnectionStatus />
                          <MemoizedNotificationCenter />
                          
                          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10 ml-1 sm:ml-2">
                              <div className="text-right hidden md:block">
                                  <p className="text-sm font-bold text-gray-200 tracking-tight leading-none max-w-[150px] truncate">
                                      {user?.full_name || user?.username || 'Kullanıcı'}
                                  </p>
                                  <p className="text-[10px] text-orange-500/80 font-medium uppercase tracking-wider mt-1">
                                      {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                  </p>
                              </div>
                              
                              <div className="ring-2 ring-white/5 rounded-full p-0.5 hover:ring-orange-500/30 transition-all">
                                  <ProfilePhotoUpload className="h-8 w-8 sm:h-9 sm:w-9" />
                              </div>

                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={handleLogout}
                                          className="hidden sm:flex ml-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors h-8 w-8 sm:h-9 sm:w-9"
                                      >
                                          <LogOut className="w-4 h-4" />
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#1a1a1a] border-white/10 text-white">
                                      <p>Çıkış Yap</p>
                                  </TooltipContent>
                              </Tooltip>
                          </div>
                      </div>
                  </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 relative scrollbar-thin scrollbar-thumb-zinc-800">
                  {/* Local background noise */}
                  <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.03] fixed"></div>
                  
                  <div className="relative z-10 max-w-[1400px] mx-auto">
                      <Outlet />
                  </div>
              </main>
          </div>
      </div>
    </TooltipProvider>
  );
}

export default memo(DashboardLayout);
