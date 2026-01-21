import React, { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays, differenceInMonths, format, startOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';

// Helper
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr); 
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

function FairCalendar() {
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0);

  useEffect(() => {
    const fetchFairs = async () => {
      try {
        const { data, error } = await supabase
          .from('fairs')
          .select('id, fair_name, city, start_date, end_date')
          .order('start_date', { ascending: true });
        
        if (error) throw error;
        setFairs(data || []);
      } catch (err) {
        console.error('Failed to fetch fairs for sidebar widget:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFairs();
  }, []);

  const groupedFairs = useMemo(() => {
    const groups = {};
    const currentMonthKey = format(currentDate, 'yyyy-MM');

    fairs.forEach(fair => {
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

    // Limit sidebar to show mostly upcoming, maybe 1 recent past group if exists
    return [...upcoming, ...past].slice(0, 5); // Show top 5 groups to stay compact
  }, [fairs]);

  const getTimeRemaining = (dateStr) => {
    const eventDate = parseLocalDate(dateStr);
    const months = differenceInMonths(eventDate, currentDate);
    const days = differenceInDays(eventDate, currentDate);

    if (days < 0) return "Geçmiş";
    if (days === 0) return "Bugün";
    if (months > 0) return `${months} ay kaldı`;
    return `${days} gün kaldı`;
  };

  if (loading) {
    return (
        <div className="h-[300px] flex items-center justify-center bg-slate-800/30 rounded-xl border border-slate-800">
            <Loader2 className="w-6 h-6 text-[#FF6200] animate-spin" />
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Fuar Takvimi</h2>
          <p className="text-slate-400 text-xs">Yaklaşan Etkinlikler</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 max-h-[500px]">
        {groupedFairs.length === 0 ? (
            <div className="text-center text-slate-500 py-10 text-sm">Planlanmış fuar yok.</div>
        ) : (
            groupedFairs.map(group => (
                <div key={group.key} className={cn("space-y-2", group.isPast && "opacity-50 grayscale")}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-[#0a0a0a]/90 py-1 backdrop-blur-sm">
                        {format(group.date, 'MMMM yyyy', { locale: tr })}
                    </h3>
                    <div className="space-y-2">
                        {group.fairs.map(fair => {
                            const endDate = fair.end_date ? parseLocalDate(fair.end_date) : parseLocalDate(fair.start_date);
                            const isFairEnded = endDate < currentDate;

                            return (
                                <div key={fair.id} className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 hover:border-[#FF6200]/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={cn(
                                            "font-medium text-sm line-clamp-1 transition-colors",
                                            isFairEnded ? "text-slate-500 line-through" : "text-white group-hover:text-[#FF6200]"
                                        )}>
                                            {fair.fair_name}
                                        </h4>
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ml-2",
                                            isFairEnded ? "bg-slate-700 text-slate-400" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {getTimeRemaining(fair.start_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className={cn("flex items-center gap-1", isFairEnded && "line-through opacity-70")}>
                                            <MapPin className="w-3 h-3" /> {fair.city}
                                        </span>
                                        <span>•</span>
                                        <span className={cn(isFairEnded && "line-through opacity-70")}>
                                            {format(parseLocalDate(fair.start_date), 'd MMM')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

export default FairCalendar;