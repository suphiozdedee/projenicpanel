
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import CardButton from '@/components/CardButton';
import { CardButtonGroup } from '@/components/CardButtonGroup';
import { Loader2, HardHat, Truck, Box, Image as ImageIcon, Zap, Hammer, CheckCircle2, FlaskConical, FileText, Stamp, Layers, Cog, Eye, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { NotificationService } from '@/services/NotificationService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { safeQuery } from '@/lib/networkUtils';
import { translateStatus } from '@/lib/statusTranslations';

const OpItem = ({ icon: Icon, label, checked, onChange, colorClass = "text-zinc-400" }) => (
    <div 
        className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer select-none"
        onClick={() => onChange(!checked)}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-zinc-950 border border-zinc-800 ${checked ? 'opacity-50' : 'opacity-100'}`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
            </div>
            <span className={`text-sm font-medium transition-all ${checked ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                {label}
            </span>
        </div>
        <Switch 
            checked={checked || false} 
            onCheckedChange={onChange} 
            className="data-[state=checked]:bg-[#FF6200]"
            onClick={(e) => e.stopPropagation()} 
        />
    </div>
);

export default function OperationPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
     if (!supabase) {
         setLoading(false);
         return;
     }

     try {
         setLoading(true);
         const { data, error } = await safeQuery(
            () => supabase
                .from('projects')
                .select('*')
                .in('status', ['Onaylandı', 'Üretimde', 'Tamamlandı', 'Proje Bitti'])
                .order('updated_at', { ascending: false }),
            { 
                key: 'operation_projects', 
                ttl: 30000,
                errorMessage: 'Operasyon projeleri yüklenirken hata oluştu.'
            }
         );

         if (error) throw error;
         setProjects(data || []);
     } catch (error) {
         console.error("Operations loading failed", error);
     } finally {
         setLoading(false);
     }
  };

  const toggleOp = async (projectId, key, label) => {
      if (!supabase) return;
      
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) return;

      const project = projects[projectIndex];
      const currentDetails = project.production_details || {};
      const newValue = !currentDetails[key];
      const updatedDetails = { ...currentDetails, [key]: newValue };

      // Optimistic Update
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = { ...project, production_details: updatedDetails };
      setProjects(updatedProjects);

      try {
          const { error } = await supabase
            .from('projects')
            .update({ production_details: updatedDetails, updated_at: new Date().toISOString() })
            .eq('id', projectId);

          if (error) throw error;
          
          if (newValue) {
              // Notification logic (non-blocking)
              NotificationService.createNotification(
                  project.created_by, 
                  'production_update', 
                  `Üretim aşaması tamamlandı: ${label} - ${project.brand}`, 
                  project.id
              ).catch(console.error);
          }
      } catch (error) {
          setProjects(projects); // Revert on error
          console.error('Update failed:', error);
          toast({ variant: "destructive", title: "Hata", description: "İşlem kaydedilemedi, değişiklikler geri alındı." });
      }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">
       <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Hammer className="w-5 h-5 text-[#FF6200]" /> Operasyon ve Üretim
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Onaylanmış projelerin üretim, nakliye ve montaj süreçlerini yönetin.</p>
          </div>
          <Badge variant="outline" className="h-8 px-3 text-xs border-green-500/30 bg-green-500/10 text-green-400">
            {projects.length} Aktif Proje
          </Badge>
       </div>

       {loading ? (
           <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-[#FF6200] w-10 h-10" />
           </div>
       ) : projects.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
               <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                    <CheckCircle2 className="w-8 h-8 text-zinc-600" />
               </div>
               <h3 className="text-xl font-semibold text-white mb-2">Operasyon Bekleyen Proje Yok</h3>
               <p className="text-zinc-500 text-center max-w-md">Onaylanan projeler otomatik olarak buraya düşecektir. Briefler sayfasından veya Teklifler sayfasından projeleri onaylayabilirsiniz.</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projects.map(project => (
                   <Card key={project.id} className="bg-[#0A0A0A]/40 border border-white/5 hover:border-white/10 flex flex-col h-full overflow-hidden transition-all shadow-lg hover:shadow-xl">
                       <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0 border-b border-white/5 bg-white/[0.02]">
                           <div className="space-y-1.5 overflow-hidden pr-4">
                               <CardTitle className="text-white text-base font-bold truncate" title={project.brand}>
                                   {project.brand}
                               </CardTitle>
                               <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 text-xs text-zinc-400">
                                       <Box className="w-3.5 h-3.5 text-[#FF6200] shrink-0" /> 
                                       <span className="truncate" title={project.fair_event}>{project.fair_event}</span>
                                   </div>
                                   {project.start_date && (
                                       <span className="text-[10px] text-zinc-500 pl-[22px]">
                                           {format(new Date(project.start_date), 'd MMMM yyyy', { locale: tr })}
                                       </span>
                                   )}
                               </div>
                           </div>
                           <Badge className="bg-green-500/10 text-green-400 border-green-500/30 whitespace-nowrap text-[10px] px-2 py-0.5 h-5">
                               {translateStatus(project.status)}
                           </Badge>
                       </CardHeader>
                       
                       <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                           <div className="space-y-3">
                               <h4 className="text-[10px] font-bold text-[#FF6200] uppercase tracking-wider mb-2 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-[#FF6200]"></div> Üretim Hazırlığı
                               </h4>
                               <div className="grid gap-2">
                                   <OpItem icon={Hammer} label="Ahşap Üretimi" checked={project.production_details?.wood} onChange={(val) => toggleOp(project.id, 'wood', "Ahşap Üretimi")} />
                                   <OpItem icon={Box} label="Demir İmalatı" checked={project.production_details?.metal} onChange={(val) => toggleOp(project.id, 'metal', "Demir İmalatı")} />
                                   <OpItem icon={FlaskConical} label="Cam İmalatı" checked={project.production_details?.glass} onChange={(val) => toggleOp(project.id, 'glass', "Cam İmalatı")} />
                                   <OpItem icon={Cog} label="CNC İmalatı" checked={project.production_details?.cnc} onChange={(val) => toggleOp(project.id, 'cnc', "CNC İmalatı")} />
                               </div>
                           </div>
                           
                           <div className="space-y-3">
                               <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Teknik & Dokümantasyon
                               </h4>
                               <div className="grid gap-2">
                                   <OpItem icon={ImageIcon} label="Dijital Baskı" checked={project.production_details?.digital_print} onChange={(val) => toggleOp(project.id, 'digital_print', "Dijital Baskı")} colorClass="text-blue-400" />
                                   <OpItem icon={FileText} label="Fuar Giriş Evrakları" checked={project.production_details?.fair_docs} onChange={(val) => toggleOp(project.id, 'fair_docs', "Fuar Giriş Evrakları")} colorClass="text-blue-400" />
                                    <OpItem icon={Stamp} label="Proje Statik Onayı" checked={project.production_details?.static_approval} onChange={(val) => toggleOp(project.id, 'static_approval', "Proje Statik Onayı")} colorClass="text-blue-400" />
                                   <OpItem icon={Layers} label="Pleksi İmalatı" checked={project.production_details?.plexi} onChange={(val) => toggleOp(project.id, 'plexi', "Pleksi İmalatı")} colorClass="text-blue-400" />
                                   <OpItem icon={Zap} label="Elektrik / Aydınlatma" checked={project.production_details?.electric} onChange={(val) => toggleOp(project.id, 'electric', "Elektrik / Aydınlatma")} colorClass="text-blue-400" />
                               </div>
                           </div>
                           
                           <div className="space-y-3">
                               <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Lojistik & Kurulum
                               </h4>
                               <div className="grid gap-2">
                                   <OpItem icon={Truck} label="Nakliye Planlama" checked={project.production_details?.logistics} onChange={(val) => toggleOp(project.id, 'logistics', "Nakliye Planlama")} colorClass="text-purple-400" />
                                   <OpItem icon={HardHat} label="Saha Montajı" checked={project.production_details?.assembly} onChange={(val) => toggleOp(project.id, 'assembly', "Saha Montajı")} colorClass="text-purple-400" />
                               </div>
                           </div>
                           
                           <div className="pt-2 mt-4 border-t border-white/5">
                                <CardButtonGroup>
                                    <CardButton variant="secondary" icon={Eye} className="w-full justify-center">Detay</CardButton>
                                </CardButtonGroup>
                           </div>
                       </CardContent>
                   </Card>
               ))}
           </div>
       )}
    </div>
  );
}
