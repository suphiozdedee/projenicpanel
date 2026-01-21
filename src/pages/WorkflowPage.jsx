
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Briefcase, 
    PenTool, 
    CheckCircle, 
    AlertCircle, 
    TrendingUp, 
    Clock,
    Banknote,
    ChevronDown,
    ChevronUp,
    Calendar,
    MapPin,
    Lock
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRevenuePermissions } from '@/hooks/useRevenuePermissions';
import { motion } from 'framer-motion';
import { safeQuery } from '@/lib/networkUtils';
import { translateStatus, getStatusColor } from '@/lib/statusTranslations';

// Base64 noise texture to avoid external dependency issues
const NOISE_SVG_DATA_URI = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E`;

const ExpandableText = ({ text, maxLength = 120 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return <span className="text-zinc-600 italic text-sm">Açıklama girilmemiş.</span>;
  
  if (text.length <= maxLength) {
    return <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-zinc-400 text-sm leading-relaxed">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button 
        onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }}
        className="text-xs font-medium text-[#FF6200] hover:text-[#FF8000] flex items-center gap-1 transition-colors focus:outline-none hover:underline"
      >
        {isExpanded ? (
            <>
                <ChevronUp className="w-3 h-3" />
                Daha az göster
            </>
        ) : (
            <>
                <ChevronDown className="w-3 h-3" />
                Daha fazla göster
            </>
        )}
      </button>
    </div>
  );
};

export default function WorkflowPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
      briefs: 0,
      designing: 0,
      completed_design: 0,
      revisions: 0,
      pending_quote: 0,
      approved: 0,
      rejected: 0,
      total_revenue: 0
  });

  const { hasAccess: canViewRevenue, loading: loadingPermissions } = useRevenuePermissions();

  useEffect(() => {
     fetchStats();
  }, []);

  const fetchStats = async () => {
    // Task 4: Null check for supabase
    if (!supabase) return;

    const result = await safeQuery(
        () => supabase.from('projects').select('*'),
        { 
          errorMessage: 'Projeler yüklenemedi',
          fallbackValue: []
        }
    );

    const fetchedProjects = result.data;

    if (fetchedProjects && fetchedProjects.length > 0) {
        const newStats = {
            briefs: fetchedProjects.length,
            designing: fetchedProjects.filter(p => p.status === 'Çiziliyor').length,
            completed_design: fetchedProjects.filter(p => p.status === 'Tamamlandı').length,
            revisions: fetchedProjects.filter(p => p.status === 'Revize').length,
            pending_quote: fetchedProjects.filter(p => p.status === 'Teklif Bekliyor').length,
            approved: fetchedProjects.filter(p => p.status === 'Onaylandı').length,
            rejected: fetchedProjects.filter(p => p.status === 'Reddedildi').length,
            total_revenue: fetchedProjects
                .filter(p => p.status === 'Onaylandı')
                .reduce((sum, p) => sum + (Number(p.price) || 0), 0)
        };
        setStats(newStats);

        const sorted = [...fetchedProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProjects(sorted.slice(0, 10)); 
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay }}
        className="group relative p-6 rounded-2xl bg-[#0A0A0A]/40 border border-white/5 backdrop-blur-sm hover:bg-[#121212]/80 hover:border-white/10 transition-all duration-300 overflow-hidden"
      >
          {/* Top glow line matching color */}
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}></div>
          
          <div className="relative z-10 flex items-start justify-between">
              <div>
                  <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</p>
                  <h3 className="text-3xl font-bold text-white mt-3 tracking-tight font-display">{value}</h3>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Icon className="w-5 h-5" style={{ color: color }} />
              </div>
          </div>
      </motion.div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 pt-2 px-4 md:px-0">
       
       {/* Header Section */}
       <motion.div 
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0A]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden"
       >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
             <h1 className="text-2xl font-bold text-white tracking-tight">İş Akışına Genel Bakış</h1>
             <p className="text-zinc-400 mt-1 text-sm">Projelerin güncel durumlarını ve istatistiklerini buradan takip edebilirsiniz.</p>
          </div>
       </motion.div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard title="Brief Sayısı" value={stats.briefs} icon={Briefcase} color="#94a3b8" delay={0.1} />
           <StatCard title="Çizilen" value={stats.designing} icon={PenTool} color="#3b82f6" delay={0.15} />
           <StatCard title="Tasarım Bitti" value={stats.completed_design} icon={CheckCircle} color="#22c55e" delay={0.2} />
           <StatCard title="Revize" value={stats.revisions} icon={AlertCircle} color="#ef4444" delay={0.25} />
           <StatCard title="Teklif Bekleyen" value={stats.pending_quote} icon={Clock} color="#a855f7" delay={0.3} />
           <StatCard title="Onaylanan" value={stats.approved} icon={CheckCircle} color="#10b981" delay={0.35} />
           <StatCard title="Reddedilen" value={stats.rejected} icon={AlertCircle} color="#f43f5e" delay={0.4} />
           <StatCard title="Teklif Sayısı" value={stats.approved + stats.rejected + stats.pending_quote} icon={Banknote} color="#6366f1" delay={0.45} />
       </div>

       {/* Recent Activities Section */}
       <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
               <h2 className="text-lg font-bold text-white tracking-tight">Son Hareketler</h2>
           </div>
           
           <div className="grid gap-3">
               {projects.length === 0 ? (
                   <div className="text-center py-16 bg-[#0A0A0A]/40 rounded-2xl border border-dashed border-zinc-800">
                       <Briefcase className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                       <p className="text-zinc-500 font-medium">Henüz proje kaydı bulunmuyor.</p>
                   </div>
               ) : (
                   projects.map((project, index) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: index * 0.05 }}
                         key={project.id} 
                         className="group relative bg-[#0A0A0A]/60 hover:bg-[#101010] border border-white/5 hover:border-white/10 transition-all duration-300 rounded-2xl overflow-hidden"
                       >
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           
                           <CardContent className="p-5 md:p-6">
                               <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                   {/* Left Column: Title & Status */}
                                   <div className="md:w-1/4 space-y-3">
                                       <div>
                                           <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-orange-500 transition-colors duration-300">{project.brand}</h3>
                                           <div className="flex items-center text-xs text-zinc-500 mt-1.5 font-medium">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                                {format(new Date(project.created_at), 'd MMMM yyyy', { locale: tr })}
                                           </div>
                                       </div>
                                       
                                       <div className="flex flex-wrap gap-2 pt-1">
                                           <Badge variant="outline" className={cn(
                                                "rounded-md border-0 py-1 px-2.5 font-medium shadow-sm",
                                                getStatusColor(project.status)
                                           )}>
                                               {translateStatus(project.status)}
                                           </Badge>
                                       </div>
                                   </div>

                                   {/* Middle Column: Description */}
                                   <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8">
                                       <div className="mb-2 flex items-center gap-2">
                                           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Açıklama</span>
                                       </div>
                                       <ExpandableText text={project.description} />
                                       
                                       {project.fair_event && (
                                            <div className="mt-4 flex items-center text-sm text-zinc-500 bg-white/[0.02] py-1.5 px-3 rounded-lg w-fit border border-white/5">
                                                <MapPin className="w-3.5 h-3.5 mr-2 text-orange-500/70" />
                                                Fuar: <span className="text-zinc-300 ml-1 font-medium">{project.fair_event}</span>
                                            </div>
                                       )}
                                   </div>

                                   {/* Right Column: Financials & User */}
                                   <div className="md:w-1/4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8 flex flex-col justify-center h-full min-h-[100px]">
                                       <div className="space-y-4">
                                           <div>
                                               <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Teklif Tutarı</span>
                                               {project.price ? (
                                                   <div className="text-xl font-bold text-emerald-400 font-mono tracking-tight">
                                                       {formatCurrency(project.price)}
                                                   </div>
                                               ) : (
                                                   <div className="text-sm text-zinc-600 italic">
                                                       Henüz teklif verilmedi
                                                   </div>
                                               )}
                                           </div>
                                           
                                           <div>
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Temsilci</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px] text-orange-500 font-bold">
                                                        {(project.assigned_to_user?.full_name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="text-sm text-zinc-300 font-medium">
                                                        {project.assigned_to_user?.full_name || 'Atanmamış'}
                                                    </div>
                                                </div>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </CardContent>
                       </motion.div>
                   ))
               )}
           </div>
       </div>

       {/* Revenue Card */}
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className="relative group rounded-2xl bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/60 border border-white/5 overflow-hidden"
       >
           {/* Replaced external URL with Data URI for safety */}
           <div 
             className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
           ></div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

           <CardContent className="p-8 relative z-10">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                       <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                           <TrendingUp className="w-8 h-8" />
                       </div>
                       <div>
                           <h3 className="text-xl font-bold text-white tracking-tight">Toplam Ciro</h3>
                           <p className="text-zinc-500 mt-1 text-sm">Onaylanan projelerden elde edilen toplam gelir</p>
                       </div>
                   </div>
                   
                   <div className="w-full md:w-auto text-right">
                       {loadingPermissions ? (
                           <div className="h-14 w-48 bg-zinc-800/50 rounded-xl animate-pulse ml-auto"></div>
                       ) : canViewRevenue ? (
                           <div className="flex flex-col items-end">
                                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 tracking-tight font-display">
                                    {formatCurrency(stats.total_revenue)}
                                </div>
                                <div className="text-xs text-emerald-500/50 font-mono mt-1">GÜNCEL FİNANSAL VERİ</div>
                           </div>
                       ) : (
                           <div className="flex items-center gap-3 px-5 py-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                               <Lock className="w-5 h-5 text-red-500/60" />
                               <div className="text-left">
                                   <h4 className="text-red-200/80 font-medium text-sm">Erişim İzniniz Yok</h4>
                                   <p className="text-red-200/40 text-xs">Yönetici izni gereklidir.</p>
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </CardContent>
       </motion.div>
    </div>
  );
}
