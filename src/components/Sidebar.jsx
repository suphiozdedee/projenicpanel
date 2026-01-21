import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  CalendarDays, 
  Settings, 
  Users, 
  HardHat,
  Banknote,
  FileSpreadsheet,
  ShieldAlert
} from 'lucide-react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LOGO_URL = "https://horizons-cdn.hostinger.com/b6d2081a-ee07-4354-8c90-69e8e22eec7a/07c9390d9bf83cb7e0ef1d96351a1f58.png";

export default function Sidebar() {
  const { user } = useSimpleAuth();
  const navigate = useNavigate();

  const isDesigner = user?.role === 'designer';
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { 
      title: 'İş Akışı', 
      path: '/workflow', 
      icon: LayoutDashboard,
      hidden: isDesigner || isAdmin 
    },
    {
      title: 'Yönetici',
      path: '/admin-dashboard',
      icon: ShieldAlert,
      hidden: !isAdmin
    },
    { 
      title: 'Briefler', 
      path: '/briefs', 
      icon: FileText,
      hidden: isDesigner 
    },
    { 
      title: 'Tasarım', // Changed from 'Projeler' to 'Tasarım'
      path: '/projects', 
      icon: Briefcase,
      hidden: false 
    },
    { 
      title: 'Teklifler', 
      path: '/quotes', 
      icon: Banknote,
      hidden: isDesigner 
    },
    { 
      title: 'Operasyon', 
      path: '/operations', 
      icon: HardHat,
      hidden: isDesigner 
    },
    { 
      title: 'Müşteriler', 
      path: '/customers', 
      icon: Users,
      hidden: isDesigner 
    },
    { 
      title: 'Takvim', 
      path: '/calendar', 
      icon: CalendarDays,
      hidden: isDesigner 
    },
    {
      title: 'Liste Çıkart',
      path: '/export-list',
      icon: FileSpreadsheet,
      hidden: false
    },
    {
       title: 'Kullanıcılar',
       path: '/admin/users',
       icon: Users,
       hidden: !isAdmin,
    },
    { 
      title: 'Ayarlar', 
      path: '/settings', 
      icon: Settings,
      hidden: false 
    },
  ];

  return (
    <div className="h-full flex flex-col w-full sm:w-[64px] md:w-[240px] bg-[#030303] border-r border-white/5 relative overflow-hidden transition-all duration-300">
      {/* Background noise texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

      {/* Sidebar Header with Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/5 relative bg-[#030303]/80 backdrop-blur-xl z-20">
         {/* Tech Gradient Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        
        <div className="relative group cursor-pointer p-2" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/workflow')}>
             <div className="absolute -inset-4 bg-orange-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             {/* Logo - Full on Mobile/Desktop, Icon only on Tablet */}
             <img 
                src={LOGO_URL} 
                alt="Projenic" 
                className="h-8 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] block sm:hidden md:block" 
             />
             {/* Simple Icon for Tablet Compact View */}
             <div className="hidden sm:flex md:hidden h-8 w-8 bg-[#FF6200] rounded-lg items-center justify-center text-white font-bold text-xl relative z-10">
                 P
             </div>
        </div>
      </div>

      <nav className="flex-1 px-2 md:px-4 py-4 md:py-6 space-y-1 md:space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        <TooltipProvider delayDuration={0}>
        {menuItems.filter(item => !item.hidden).map((item) => (
            <div key={item.path}>
             <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                    "relative flex items-center gap-3 px-3 py-3 md:px-4 rounded-lg transition-all duration-300 group overflow-hidden border justify-center md:justify-start",
                    isActive 
                        ? "bg-[#FF6200] text-white shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] border-orange-500/50" 
                        : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
                    )}
                >
                    {({ isActive }) => (
                      <>
                        {/* Active State Background Pattern */}
                        {isActive && (
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4px_4px]" />
                        )}

                        <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-300 relative z-10", 
                          !isActive && "group-hover:scale-110 group-hover:text-orange-400" 
                        )} />
                        
                        <span className={cn(
                            "font-medium text-sm relative z-10 tracking-wide transition-all duration-300", 
                            !isActive && "group-hover:translate-x-1",
                            "hidden md:block" // Hide text on tablet compact
                        )}>
                            {item.title}
                        </span>
                        
                        {/* Mobile Text (Since mobile sidebar is full width drawer) */}
                        <span className="md:hidden block font-medium text-sm relative z-10 ml-2">
                            {item.title}
                        </span>
                      </>
                    )}
                </NavLink>
               </TooltipTrigger>
               {/* Show tooltip only on compact view (sm but not md) */}
               <TooltipContent side="right" className="hidden sm:block md:hidden bg-zinc-900 border-zinc-800 text-white">
                 {item.title}
               </TooltipContent>
              </Tooltip>
            </div>
        ))}
        </TooltipProvider>
      </nav>

      <div className="p-2 md:p-4 border-t border-white/5 relative z-10 bg-[#030303]/50 backdrop-blur-sm hidden md:block">
        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 hover:border-orange-500/20 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors duration-500" />
            
            <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">Depolama</p>
                <span className="text-[10px] text-orange-500/80 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">PRO</span>
            </div>
            
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full w-[35%] bg-gradient-to-r from-orange-600 to-orange-500 rounded-full shadow-[0_0_10px_rgba(255,98,0,0.5)] group-hover:w-[38%] transition-all duration-700 ease-out" />
            </div>
            
            <p className="text-[10px] text-zinc-500 mt-2 text-right font-mono group-hover:text-zinc-400 transition-colors">3.5GB / 10GB</p>
        </div>
      </div>
    </div>
  );
}