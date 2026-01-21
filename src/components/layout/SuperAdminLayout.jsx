import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  MessageSquare, 
  LogOut,
  ShieldAlert,
  Banknote,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin session
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Panel', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Tüm Projeler', href: '/admin/projects', icon: Database },
    { name: 'Fuar Yönetimi', href: '/admin/fairs', icon: CalendarDays },
    { name: 'Finans & Gelir', href: '/admin/revenue', icon: Banknote },
    { name: 'Sohbet Kayıtları', href: '/admin/chats', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-red-900/20 bg-[#050505] flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-red-900/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              A
            </div>
            <span className="text-xl font-display font-bold text-red-500">Yönetim</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 mb-4">
             <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                <ShieldAlert className="w-3 h-3" />
                SÜPER YETKİ
             </div>
             <p className="text-[10px] text-zinc-500 leading-tight">
               Tam sistem erişimi aktif. Dikkatli işlem yapınız.
             </p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}