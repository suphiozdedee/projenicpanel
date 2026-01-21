import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Hammer, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Factory,
  ArrowRight,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function OperationsPage() {
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [subcontractorName, setSubcontractorName] = useState('');
  const [productionStage, setProductionStage] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Approved Projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['Onaylandı', 'Approved'])
      .order('start_date', { ascending: true });
    
    // Fetch Workshop Capacities
    const { data: workshopData } = await supabase
      .from('workshop_capacity')
      .select('*')
      .order('workshop_name');

    setApprovedProjects(projectsData || []);
    setWorkshops(workshopData || []);
    setLoading(false);
  };

  const handleUpdateStage = async (project, stage) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ production_stage: stage })
        .eq('id', project.id);

      if (error) throw error;

      toast({ title: "Aşama Güncellendi", description: `${project.brand} - ${stage}` });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    }
  };

  const openAssignModal = (project) => {
    setSelectedProject(project);
    setSubcontractorName(project.subcontractor || '');
    setProductionStage(project.production_stage || 'Başladı');
    setIsAssignOpen(true);
  };

  const saveAssignment = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          subcontractor: subcontractorName,
          production_stage: productionStage
        })
        .eq('id', selectedProject.id);

      if (error) throw error;
      toast({ title: "Başarılı", description: "Atölye ve taşeron bilgileri kaydedildi." });
      setIsAssignOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Başladı': return 'bg-blue-500';
      case 'Aşama 1': return 'bg-yellow-500';
      case 'Aşama 2': return 'bg-orange-500';
      case 'Aşama 3': return 'bg-purple-500';
      case 'Tamamlandı': return 'bg-green-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-display">Operasyon & Üretim</h1>
        <p className="text-zinc-400">Atölye kapasitesi, taşeron takibi ve üretim aşamaları.</p>
      </div>

      {/* Workshop Capacity Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workshops.map((workshop) => (
          <Card key={workshop.id} className="bg-[#0a0a0a] border-zinc-800">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  {workshop.workshop_name}
                  <Factory className="w-4 h-4 text-[#FF6200]" />
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-bold text-white">{workshop.capacity_percentage}%</span>
                  <span className="text-xs text-zinc-500 mb-1">{workshop.current_projects_count} Aktif Proje</span>
               </div>
               <Progress value={workshop.capacity_percentage} className="h-2" indicatorClassName={
                  workshop.capacity_percentage > 80 ? 'bg-red-500' : 
                  workshop.capacity_percentage > 50 ? 'bg-[#FF6200]' : 'bg-green-500'
               } />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approved Projects Tracking */}
      <Card className="bg-[#0a0a0a] border-zinc-800">
         <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5 text-green-500" />
               Onaylı Projeler ve Üretim Durumu
            </CardTitle>
            <CardDescription className="text-zinc-500">
               Onaylanmış projelerin taşeron atamaları ve üretim ilerleme aşamaları.
            </CardDescription>
         </CardHeader>
         <CardContent>
            {loading ? (
               <div className="text-center py-8 text-zinc-500">Yükleniyor...</div>
            ) : approvedProjects.length === 0 ? (
               <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  Henüz onaylanmış proje yok.
               </div>
            ) : (
               <div className="space-y-4">
                  {approvedProjects.map((project) => (
                     <div key={project.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold text-lg">{project.brand}</h3>
                              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500 bg-green-500/10">
                                 ONAYLANDI
                              </Badge>
                           </div>
                           <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                              <span className="flex items-center gap-1">
                                 <Factory className="w-3 h-3" />
                                 {project.fair_event}
                              </span>
                              {project.subcontractor ? (
                                 <span className="flex items-center gap-1 text-[#FF6200]">
                                    <Hammer className="w-3 h-3" />
                                    {project.subcontractor}
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1 text-red-400">
                                    <AlertCircle className="w-3 h-3" />
                                    Taşeron Atanmadı
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Production Stage Visualization */}
                        <div className="flex items-center gap-2">
                           <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider">Aşama</span>
                              <Badge className={`${getStageColor(project.production_stage)} text-white border-0`}>
                                 {project.production_stage || 'Başlamadı'}
                              </Badge>
                           </div>
                           
                           <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                              onClick={() => openAssignModal(project)}
                           >
                              <Users className="w-3 h-3 mr-2" />
                              Yönet
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
         <DialogContent className="bg-[#0a0a0a] border-zinc-800 text-white">
            <DialogHeader>
               <DialogTitle>Üretim Yönetimi: {selectedProject?.brand}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>Taşeron / Atölye</Label>
                  <div className="relative">
                     <Hammer className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                     <Input 
                        placeholder="Örn: Yılmaz Ahşap, Metal İşleri A.Ş."
                        value={subcontractorName}
                        onChange={(e) => setSubcontractorName(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-800 focus:ring-[#FF6200]" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label>Mevcut Aşama</Label>
                  <select
                     className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF6200]"
                     value={productionStage}
                     onChange={(e) => setProductionStage(e.target.value)}
                  >
                     <option value="Başladı">Başladı</option>
                     <option value="Aşama 1">Aşama 1 (Kaba İnşaat)</option>
                     <option value="Aşama 2">Aşama 2 (Montaj)</option>
                     <option value="Aşama 3">Aşama 3 (Boya & Cila)</option>
                     <option value="Paketleme">Paketleme</option>
                     <option value="Sevkiyat">Sevkiyat</option>
                     <option value="Tamamlandı">Tamamlandı</option>
                  </select>
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>İptal</Button>
               <Button className="bg-[#FF6200] hover:bg-[#FF6200]/90 text-white" onClick={saveAssignment}>
                  Kaydet
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}