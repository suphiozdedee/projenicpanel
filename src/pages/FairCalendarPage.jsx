
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Loader2,
  MapPin,
  MoreVertical,
  BarChart2,
  CalendarDays,
  PenTool,
  Globe,
  RefreshCw,
  Calendar,
  User,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import CreateFairDialog from '@/components/CreateFairDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInCalendarMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { safeQuery } from '@/lib/networkUtils';

const EUROPEAN_COUNTRIES = [
  'Almanya', 'Fransa', 'İtalya', 'İngiltere', 'İspanya', 'Hollanda', 'Rusya', 
  'Polonya', 'Belçika', 'İsviçre', 'Portekiz', 'Yunanistan', 'Avusturya'
];

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr); 
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

const getFairStatus = (startStr, endStr) => {
    if (!startStr) return { text: "Tarih Yok", color: "text-zinc-500", bg: "bg-zinc-500/10" };
    
    const startDate = parseLocalDate(startStr);
    const endDate = endStr ? parseLocalDate(endStr) : startDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate < today) {
        return { text: "Geçmiş", color: "text-zinc-500", bg: "bg-zinc-800" };
    }

    if (startDate <= today && endDate >= today) {
        return { text: "Şu an Aktif", color: "text-green-500", bg: "bg-green-500/10" };
    }

    const diffMonths = differenceInCalendarMonths(startDate, today);
    
    if (diffMonths === 0) {
        return { text: "Bu ay", color: "text-[#FF6200]", bg: "bg-[#FF6200]/10" };
    } else {
        return { text: `${diffMonths} ay kaldı`, color: "text-blue-500", bg: "bg-blue-500/10" };
    }
};

export default function FairCalendarPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [fairs, setFairs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [assigningFairId, setAssigningFairId] = useState(null); 
  
  const [isFairOpen, setIsFairOpen] = useState(false);
  const [editingFair, setEditingFair] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [regionFilter, setRegionFilter] = useState('all'); 
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = useCallback(async () => {
    // Task 4: Null check for supabase
    if (!supabase) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      
      const { data: fairsData, error: fairsError } = await safeQuery(
        () => supabase.from('fairs').select('*').order('start_date', { ascending: true }),
        { key: 'fairs_list', ttl: 120000 }
      );

      if (fairsError) throw fairsError;

      const { data: assignmentsData } = await safeQuery(
        () => supabase.from('fair_assignments').select(`
            id,
            fair_id,
            user_id,
            profiles:user_id ( full_name, email )
        `),
        { key: 'assignments_list' }
      );

      const assignmentsMap = {};
      if (assignmentsData) {
          assignmentsData.forEach(item => {
              assignmentsMap[item.fair_id] = {
                  id: item.id,
                  userId: item.user_id,
                  userName: item.profiles?.full_name || 'Bilinmeyen Kullanıcı',
                  userEmail: item.profiles?.email
              };
          });
      }
      setAssignments(assignmentsMap);

      const { data: projectsData } = await safeQuery(
        () => supabase.from('projects')
            .select('id, brand, start_date, end_date, fair_event')
            .not('start_date', 'is', null)
            .order('start_date', { ascending: true }),
        { key: 'calendar_projects' }
      );

      setFairs(fairsData || []);
      setProjects(projectsData || []);

    } catch (error) {
      // safeQuery handles toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    if (supabase) {
        // Setup realtime only once
        const channels = [
          supabase.channel('public:fairs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fairs' }, () => loadData()),
          supabase.channel('public:fair_assignments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fair_assignments' }, () => loadData())
        ];
        
        channels.forEach(ch => ch.subscribe());

        return () => {
          channels.forEach(ch => supabase.removeChannel(ch));
        };
    }
  }, [loadData]);

  const handleDeleteFair = async (id) => {
    if (!supabase) return;
    if(!window.confirm("Bu fuarı silmek istediğinize emin misiniz?")) return;
    
    try {
      const { error } = await safeQuery(
        () => supabase.from('fairs').delete().eq('id', id),
        { errorMessage: 'Fuar silinemedi', forceRefresh: true }
      );
      
      if (error) throw error;
      toast({ title: "Başarılı", description: "Fuar silindi." });
      setFairs(prev => prev.filter(f => f.id !== id));
    } catch (error) {
       // handled
    }
  };

  const handleAssignmentToggle = async (fairId) => {
      if (!supabase) return;
      const currentAssignment = assignments[fairId];
      setAssigningFairId(fairId);

      try {
        if (currentAssignment) {
            if (currentAssignment.userId === user.id) {
                const { error } = await safeQuery(
                    () => supabase.from('fair_assignments').delete().eq('id', currentAssignment.id),
                    { forceRefresh: true }
                );
                
                if (error) throw error;
                
                toast({
                    description: "Görevden ayrıldınız.",
                    className: "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                });
                
                const newAssignments = { ...assignments };
                delete newAssignments[fairId];
                setAssignments(newAssignments);
            } else {
                toast({ variant: "destructive", title: "İşlem Başarısız", description: "Bu fuara zaten başka bir temsilci atanmış." });
            }
        } else {
            const { error } = await safeQuery(
                () => supabase.from('fair_assignments').insert([{ fair_id: fairId, user_id: user.id }]).select(),
                { forceRefresh: true }
            );

            if (error) {
                if (error.code === '23505') { 
                     toast({ variant: "destructive", title: "Hata", description: "Bu fuar az önce başkası tarafından alındı." });
                     loadData(); 
                } else {
                    throw error;
                }
            } else {
                toast({
                    title: "Başarılı!",
                    description: "Bu fuarda görev aldınız.",
                    className: "bg-green-500/10 border-green-500 text-green-500"
                });
                loadData(); 
            }
        }
      } catch (error) {
          // safeQuery handled generic errors
      } finally {
          setAssigningFairId(null);
      }
  };

  const openEditFair = (fair) => {
    setEditingFair(fair);
    setIsFairOpen(true);
  };

  const handleFairSuccess = () => {
    loadData();
    setIsFairOpen(false);
    setEditingFair(null);
  };

  const groupedFairs = useMemo(() => {
    const filtered = fairs.filter(fair => {
      if (regionFilter === 'all') return true;
      if (regionFilter === 'turkiye') return fair.country === 'Türkiye';
      if (regionFilter === 'avrupa') return EUROPEAN_COUNTRIES.includes(fair.country);
      if (regionFilter === 'diger') return fair.country !== 'Türkiye' && !EUROPEAN_COUNTRIES.includes(fair.country);
      return true;
    });

    const groups = {};
    const today = new Date();
    const currentMonthKey = format(today, 'yyyy-MM');

    filtered.forEach(fair => {
        const date = parseLocalDate(fair.start_date);
        if(!date) return;
        const key = format(date, 'yyyy-MM');
        if(!groups[key]) {
            groups[key] = {
                key,
                date: startOfMonth(date),
                fairs: [],
                isPast: key < currentMonthKey
            };
        }
        groups[key].fairs.push(fair);
    });

    Object.values(groups).forEach(g => {
        g.fairs.sort((a,b) => parseLocalDate(a.start_date) - parseLocalDate(b.start_date));
    });

    const allGroups = Object.values(groups);
    const upcoming = allGroups.filter(g => !g.isPast).sort((a,b) => a.date - b.date); 
    const past = allGroups.filter(g => g.isPast).sort((a,b) => b.date - a.date); 

    return [...upcoming, ...past];
  }, [fairs, regionFilter]);


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      <div className="glass-panel p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Fuar Takvimi</h1>
          <p className="text-zinc-400 mt-1">Dünya genelindeki fuarlar ve proje zaman çizelgesi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
                {['all', 'turkiye', 'avrupa', 'diger'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setRegionFilter(filter)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap capitalize",
                            regionFilter === filter ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        {filter === 'all' && <Globe className="w-3 h-3 inline-block mr-1.5 mb-0.5" />}
                        {filter === 'all' ? 'Tümü' : filter === 'turkiye' ? 'Türkiye' : filter === 'avrupa' ? 'Avrupa' : 'Diğer'}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={loadData} title="Yenile">
                   <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'secondary'} onClick={() => setViewMode('list')} className="rounded-l-lg rounded-r-none px-3">
                    <CalendarDays className="w-4 h-4 mr-2" /> Liste
                </Button>
                <Button variant={viewMode === 'gantt' ? 'default' : 'secondary'} onClick={() => setViewMode('gantt')} className="rounded-r-lg rounded-l-none px-3">
                    <BarChart2 className="w-4 h-4 mr-2" /> Gantt
                </Button>
                <Button variant="glow" onClick={() => { setEditingFair(null); setIsFairOpen(true); }} className="ml-2 shadow-lg shadow-orange-500/20">
                    <PlusCircle className="mr-2 h-4 w-4" /> Yeni Fuar
                </Button>
            </div>
        </div>
      </div>

      {loading && fairs.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF6200] animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
             <div className="space-y-2">
                {groupedFairs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-lg border border-zinc-800 border-dashed">
                        Seçilen filtrede kayıtlı fuar bulunmuyor.
                    </div>
                ) : (
                    groupedFairs.map(group => (
                        <div key={group.key} className={cn("py-6", group.isPast ? "opacity-60 grayscale-[0.5] hover:opacity-80 transition-opacity" : "")}>
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold text-white capitalize">
                                    {format(group.date, 'MMMM yyyy', { locale: tr })}
                                </h3>
                                {group.isPast ? (
                                    <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                                        Geçmiş
                                    </span>
                                ) : (
                                    <span className="text-xs bg-[#FF6200]/10 border border-[#FF6200]/30 text-[#FF6200] px-2 py-0.5 rounded-full font-medium">
                                        Yaklaşan
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.fairs.map((fair) => {
                                    const status = getFairStatus(fair.start_date, fair.end_date);
                                    const assignment = assignments[fair.id];
                                    const isAssigned = !!assignment;
                                    const isMyAssignment = isAssigned && assignment.userId === user?.id;
                                    const isAssignedToOther = isAssigned && !isMyAssignment;
                                    const isFairEnded = status.text === "Geçmiş";

                                    return (
                                        <Card key={fair.id} className="glass-card hover:border-[#FF6200]/30 transition-all duration-300 group flex flex-col h-full bg-zinc-900/40">
                                            <CardContent className="p-5 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Calendar className={cn("w-4 h-4", isFairEnded ? "text-zinc-600" : "text-[#FF6200]")} />
                                                            <span className={cn("font-semibold text-sm", isFairEnded ? "text-zinc-500 line-through" : "text-white")}>
                                                                {format(parseLocalDate(fair.start_date), 'dd.MM.yyyy')} - {fair.end_date ? format(parseLocalDate(fair.end_date), 'dd.MM.yyyy') : '?'}
                                                            </span>
                                                        </div>
                                                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium inline-block", status.color, status.bg)}>
                                                            {status.text}
                                                        </span>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white -mr-3 -mt-3">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                                        <DropdownMenuItem onClick={() => openEditFair(fair)} className="cursor-pointer hover:bg-zinc-800">
                                                            <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteFair(fair.id)} className="text-red-500 cursor-pointer hover:bg-zinc-800">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                        </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                
                                                <div className="space-y-3 mb-6 flex-grow">
                                                    <h3 className={cn("text-lg font-bold leading-tight transition-colors", isFairEnded ? "text-zinc-500 line-through" : "text-white group-hover:text-[#FF6200]")}>
                                                        {fair.fair_name}
                                                    </h3>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-start text-xs text-zinc-400">
                                                            <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 text-zinc-500 shrink-0" />
                                                            <span className={cn(isFairEnded && "line-through opacity-70")}>
                                                                {fair.venue}{fair.city ? `, ${fair.city}` : ''}
                                                                <span className="block text-zinc-500 font-medium mt-0.5 uppercase tracking-wide">{fair.country}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {isAssignedToOther && (
                                                        <div className="mt-4 p-2 bg-zinc-900/50 rounded border border-zinc-800 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-xs text-zinc-500 font-medium">Atanan Temsilci</span>
                                                                <span className="text-xs text-zinc-300 truncate font-semibold" title={assignment.userEmail}>{assignment.userName}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                                                    <Button 
                                                        onClick={() => handleAssignmentToggle(fair.id)}
                                                        disabled={isAssignedToOther || assigningFairId === fair.id}
                                                        variant={isMyAssignment ? "default" : "outline"}
                                                        className={cn(
                                                            "w-full h-10 transition-all font-medium text-xs",
                                                            isMyAssignment 
                                                                ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                                                : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        {assigningFairId === fair.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        ) : isMyAssignment ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Çalışıyorum
                                                            </>
                                                        ) : isAssignedToOther ? (
                                                            <>
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Dolu
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PlusCircle className="w-4 h-4 mr-2" />
                                                                Ben Çalışıyorum
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
             </div>
          ) : (
             <GanttView 
                fairs={fairs.filter(fair => {
                    if (regionFilter === 'all') return true;
                    if (regionFilter === 'turkiye') return fair.country === 'Türkiye';
                    if (regionFilter === 'avrupa') return EUROPEAN_COUNTRIES.includes(fair.country);
                    if (regionFilter === 'diger') return fair.country !== 'Türkiye' && !EUROPEAN_COUNTRIES.includes(fair.country);
                    return true;
                })} 
                projects={projects} 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate}
                openEditFair={openEditFair}
             />
          )}
        </>
      )}

      <CreateFairDialog 
        isOpen={isFairOpen} 
        onClose={() => setIsFairOpen(false)}
        onSuccess={handleFairSuccess}
        initialData={editingFair}
      />
    </div>
  );
}

const GanttView = ({ fairs, projects, currentDate, setCurrentDate, openEditFair }) => {
     const startDate = startOfMonth(currentDate);
     const endDate = endOfMonth(addDays(startDate, 60)); 
     const days = eachDayOfInterval({ start: startDate, end: endDate });

     const allItems = useMemo(() => [
        ...fairs.map(f => ({ 
            ...f, 
            type: 'fair', 
            label: f.fair_name,
            end_date: f.end_date || f.start_date 
        })),
        ...projects.map(p => ({ 
            ...p, 
            type: 'project', 
            label: `${p.brand} (${p.fair_event || '?'})`,
            end_date: p.end_date || p.start_date 
        }))
     ].filter(item => item.start_date)
      .sort((a,b) => parseLocalDate(a.start_date) - parseLocalDate(b.start_date)), [fairs, projects]);

     const getItemStyle = (item) => {
        const itemStart = parseLocalDate(item.start_date);
        const itemEnd = parseLocalDate(item.end_date);
        
        if (!itemStart || !itemEnd || isNaN(itemStart.getTime()) || isNaN(itemEnd.getTime())) {
            return { display: 'none' };
        }

        const offsetDays = differenceInDays(itemStart, startDate);
        const durationDays = Math.max(1, differenceInDays(itemEnd, itemStart) + 1);
        
        const dayWidth = 40;
        const left = offsetDays * dayWidth;
        const width = durationDays * dayWidth;

        if (itemEnd < startDate || itemStart > endDate) {
            return { display: 'none' };
        }

        return { 
           left: `${Math.max(0, left)}px`, 
           width: `${Math.max(dayWidth, width)}px`,
           position: 'absolute'
        };
     };

     return (
        <div className="glass-panel p-4 overflow-hidden flex flex-col h-[600px]">
           <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h3 className="text-white font-medium capitalize flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6200]" />
                  {format(startDate, 'MMMM yyyy', { locale: tr })} - {format(endDate, 'MMMM yyyy', { locale: tr })}
              </h3>
              <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentDate(addDays(currentDate, -30))}>&lt; Geri</Button>
                  <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>Bugün</Button>
                  <Button size="sm" variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 30))}>İleri &gt;</Button>
              </div>
           </div>

           <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-800 rounded-lg relative bg-zinc-950/50">
              <div className="flex sticky top-0 z-20 bg-zinc-900 border-b border-zinc-800 min-w-max h-12">
                 {days.map((day, i) => (
                    <div key={i} className={cn(
                        "w-[40px] flex-shrink-0 flex flex-col items-center justify-center border-r border-zinc-800/50 text-[10px] text-zinc-400 font-medium",
                        isSameDay(day, new Date()) && "bg-[#FF6200]/10 text-[#FF6200]"
                    )}>
                        <span>{format(day, 'dd')}</span>
                        <span className="text-[8px] opacity-60">{format(day, 'EEE', { locale: tr })}</span>
                    </div>
                 ))}
              </div>

              <div className="relative min-w-max pb-10">
                 <div className="absolute inset-0 flex pointer-events-none z-0">
                    {days.map((_, i) => (
                       <div key={i} className="w-[40px] flex-shrink-0 border-r border-zinc-800/20 h-full" />
                    ))}
                 </div>

                 <div className="space-y-1 pt-4 px-0 relative z-10">
                    {allItems.map((item, idx) => {
                        const style = getItemStyle(item);
                        if (style.display === 'none') return null;
                        
                        return (
                           <div key={idx} className="relative h-10 w-full">
                              <div 
                                 className={cn(
                                    "absolute h-8 rounded-md flex items-center px-2 text-xs font-medium text-white shadow-lg overflow-hidden whitespace-nowrap transition-all hover:scale-[1.01] hover:z-50 cursor-pointer",
                                    item.type === 'fair' 
                                       ? "bg-gradient-to-r from-[#FF6200] to-orange-600 border border-orange-500/30" 
                                       : "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500/30"
                                 )}
                                 style={style}
                                 title={`${item.label} (${format(parseLocalDate(item.start_date), 'dd MMM')} - ${format(parseLocalDate(item.end_date), 'dd MMM')})`}
                                 onClick={() => item.type === 'fair' ? openEditFair(item) : null}
                              >
                                 {item.type === 'project' && <PenTool className="w-3 h-3 mr-1 opacity-70" />}
                                 <span className="truncate">{item.label}</span>
                              </div>
                           </div>
                        );
                    })}
                 </div>
              </div>
           </div>
        </div>
     );
};
