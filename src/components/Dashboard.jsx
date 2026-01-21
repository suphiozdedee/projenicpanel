import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import KanbanBoard from '@/components/KanbanBoard';
import FairCalendar from '@/components/FairCalendar';
import PersonnelPanel from '@/components/PersonnelPanel';
import ChatDrawer from '@/components/ChatDrawer';
import SettingsView from '@/components/SettingsView';

function Dashboard({ user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [userRole, setUserRole] = useState('brand_representative');
  const [userData, setUserData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For responsive toggle
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulated role assignment based on email for demo purposes
        // In production, this would come strictly from Firestore
        let role = 'brand_representative';
        if (user.email.includes('admin')) role = 'admin';
        else if (user.email.includes('designer')) role = 'designer';
        else if (user.email.includes('production')) role = 'production';

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setUserRole(data.role || role);
        } else {
          setUserRole(role);
          setUserData({ role, email: user.email, displayName: user.displayName || user.email.split('@')[0] });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully" });
    } catch (error) {
      toast({ title: "Error logging out", variant: "destructive" });
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview userRole={userRole} />;
      case 'kanban': return <KanbanBoard userRole={userRole} />;
      case 'calendar': return <FairCalendar userRole={userRole} />;
      case 'personnel': return <PersonnelPanel userRole={userRole} />;
      case 'settings': return <SettingsView userRole={userRole} userData={userData} />;
      default: return <DashboardOverview userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      {/* Sidebar - Mobile Responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          activeView={activeView} 
          setActiveView={(view) => {
            setActiveView(view);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }} 
          userRole={userRole}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('-', ' ')}
                </h1>
                <p className="text-slate-400 text-sm hidden sm:block">
                  {userRole.toUpperCase().replace('_', ' ')} WORKSPACE
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                onClick={() => setIsChatOpen(true)}
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
              </Button>
              
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-900/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user}
      />
    </div>
  );
}

export default Dashboard;