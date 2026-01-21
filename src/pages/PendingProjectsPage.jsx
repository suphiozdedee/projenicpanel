import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Loader2, 
    Calendar as CalendarIcon, 
    Clock, 
    CheckCircle2, 
    Circle,
    User,
    PenTool,
    PlayCircle,
    CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Designers
const DESIGNERS = [
    { id: 'd1', name: 'Ahmet Tasarımcı' },
    { id: 'd2', name: 'Mehmet Kreatif' },
    { id: 'd3', name: 'Zeynep Çizim' }
];

export default function PendingProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      const stored = JSON.parse(localStorage.getItem('mock_projects_v2') || '[]');
      setProjects(stored);
      setLoading(false);
    };
    loadData();
  }, []);

  const saveProjects = (updatedProjects) => {
      setProjects(updatedProjects);
      localStorage.setItem('mock_projects_v2', JSON.stringify(updatedProjects));
  };

  const assignDesigner = (projectId, designerName) => {
      const updated = projects.map(p => 
          p.id === projectId ? { ...p, assigned_designer: designerName } : p
      );
      saveProjects(updated);
      toast({ 
          title: "Tasarımcı Atandı", 
          description: `Proje ${designerName} adlı kişiye atandı.` 
      });
  };

  const updateStatus = (projectId, newStatus) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const now = new Date().toISOString();
      let updatedDates = { ...project.dates };

      // Update specific date tracking based on status
      if (newStatus === 'Çiziliyor') {
          updatedDates.design_started = now;
      } else if (newStatus === 'Proje Bitti') {
          updatedDates.design_completed = now;
      }

      const updated = projects.map(p => 
          p.id === projectId ? { ...p, status: newStatus, dates: updatedDates } : p
      );
      saveProjects(updated);

      // Notification Logic
      const repName = project.rep_name || "Temsilci";
      let title = "Durum Güncellendi";
      let desc = "Proje durumu değişti.";

      if (newStatus === 'Çiziliyor') {
          title = "Tasarım Başladı";
          desc = `Sayın ${repName}, ${project.brand} projesinin çizimine başlandı.`;
      } else if (newStatus === 'Proje Bitti') {
          title = "Tasarım Tamamlandı";
          desc = `Sayın ${repName}, ${project.brand} projesinin tasarımı tamamlandı.`;
      }

      toast({ title, description: desc });
  };

  const StatusTimeline = ({ dates }) => {
     if(!dates) return null;
     
     const steps = [
        { label: 'Brief', date: dates.brief_received, active: !!dates.brief_received },
        { label: 'Başlandı', date: dates.design_started, active: !!dates.design_started },
        { label: 'Bitti', date: dates.design_completed, active: !!dates.design_completed },
        { label: 'Teklif', date: dates.quote_given, active: !!dates.quote_given },
        { label: 'Onay', date: dates.approved, active: !!dates.approved },
     ];

     return (
        <div className="flex items-center justify-between w-full mt-4 relative">
           {/* Line */}
           <div className="absolute top-2 left-0 right-0 h-0.5 bg-zinc-800 -z-10" />
           
           {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 bg-[#0a0a0a] px-2 z-10 min-w-[40px]">
                 {step.active ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10" />
                 ) : (
                    <Circle className="w-4 h-4 text-zinc-700" />
                 )}
                 <span className={cn("text-[10px] font-medium text-center", step.active ? "text-zinc-300" : "text-zinc-600")}>
                    {step.label}
                 </span>
                 {step.date && <span className="text-[8px] text-zinc-500">{format(new Date(step.date), 'dd MMM', { locale: tr })}</span>}
              </div>
           ))}
        </div>
     );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="glass-panel p-6">
        <h1 className="text-3xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Clock className="w-8 h-8 text-[#FF6200]" />
            Projeler & Tasarım Yönetimi
        </h1>
        <p className="text-zinc-400">Tüm projelerin durumu, atanan tasarımcılar ve zaman çizelgeleri.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <Loader2 className="w-10 h-10 text-[#FF6200] animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
           Kayıtlı proje bulunmamaktadır.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {projects.map(project => (
               <Card key={project.id} className={cn(
                   "glass-card hover:border-zinc-700 transition-all duration-300 group flex flex-col h-full",
                   project.status === 'Çiziliyor' ? "border-blue-500/30 bg-blue-950/5" :
                   project.status === 'Proje Bitti' ? "border-green-500/30 bg-green-950/5" : ""
               )}>
                  <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold text-white group-hover:text-[#FF6200] transition-colors line-clamp-1">
                              {project.brand}
                          </CardTitle>
                          <Badge variant="outline" className={cn(
                              "text-xs capitalize whitespace-nowrap",
                              project.status === 'Onaylandı' ? "border-green-500/50 text-green-400 bg-green-500/10" : 
                              project.status === 'Çiziliyor' ? "border-blue-500/50 text-blue-400 bg-blue-500/10 animate-pulse" :
                              project.status === 'Proje Bitti' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
                              "border-zinc-700 text-zinc-400"
                          )}>
                              {project.status || 'Bekliyor'}
                          </Badge>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3" />
                          {project.start_date ? format(new Date(project.start_date), 'dd MMMM yyyy', { locale: tr }) : 'Tarih Yok'}
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                      {/* Designer Assignment */}
                      <div className="flex items-center justify-between bg-zinc-950/30 p-2 rounded-lg border border-zinc-800/50">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                              <PenTool className="w-4 h-4 text-[#FF6200]" />
                              {project.assigned_designer || <span className="text-zinc-600 italic">Atanmadı</span>}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="xs" className="h-6 w-6 p-0 rounded-full hover:bg-zinc-800">
                                    <User className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                {DESIGNERS.map(d => (
                                    <DropdownMenuItem key={d.id} onClick={() => assignDesigner(project.id, d.name)} className="cursor-pointer">
                                        {d.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>

                      <div className="space-y-1 text-sm text-zinc-400">
                          <div className="flex justify-between">
                              <span>Fuar:</span>
                              <span className="text-white text-right line-clamp-1">{project.fair_name}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Temsilci:</span>
                              <span className="text-white">{project.rep_name}</span>
                          </div>
                      </div>
                      
                      <StatusTimeline dates={project.dates} />
                  </CardContent>
                  
                  <CardFooter className="pt-0 pb-4 flex gap-2 border-t border-zinc-800/30 mt-auto pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={cn("flex-1 text-xs border-zinc-700", project.status === 'Çiziliyor' ? "bg-blue-500/20 text-blue-300 border-blue-500/50" : "hover:bg-blue-500/10 hover:text-blue-300")}
                        onClick={() => updateStatus(project.id, 'Çiziliyor')}
                      >
                         <PlayCircle className="w-3 h-3 mr-1.5" />
                         Çiziliyor
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={cn("flex-1 text-xs border-zinc-700", project.status === 'Proje Bitti' ? "bg-green-500/20 text-green-300 border-green-500/50" : "hover:bg-green-500/10 hover:text-green-300")}
                        onClick={() => updateStatus(project.id, 'Proje Bitti')}
                      >
                         <CheckSquare className="w-3 h-3 mr-1.5" />
                         Bitti
                      </Button>
                  </CardFooter>
               </Card>
           ))}
        </div>
      )}
    </div>
  );
}