
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Search, Loader2, RefreshCw, Eye, Upload, Check, Play, Briefcase, RotateCcw, AlertCircle
} from 'lucide-react';
import CardButton from '@/components/CardButton';
import { CardButtonGroup } from '@/components/CardButtonGroup';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { safeQuery } from '@/lib/networkUtils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import ProjectViewModal from '@/components/ProjectViewModal';
import RevisionRequestDialog from '@/components/RevisionRequestDialog';
import RevisionRequestCard from '@/components/RevisionRequestCard';
import { translateStatus, getStatusColor } from '@/lib/statusTranslations';
import { useLocation } from 'react-router-dom';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("all");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Revision Dialog States
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionProject, setRevisionProject] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  // Highlight logic from notifications
  useEffect(() => {
    if (location.state?.highlightProjectId && projects.length > 0) {
        const project = projects.find(p => p.id === location.state.highlightProjectId);
        if (project) {
            if (project.revision_requested) setActiveTab("revision_pending");
            setTimeout(() => {
                const element = document.getElementById(`project-row-${project.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-white/10');
                    setTimeout(() => element.classList.remove('bg-white/10'), 2000);
                }
            }, 500);
        }
    }
  }, [location.state, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await safeQuery(
        () => supabase.from('projects').select(`*, assignee:assigned_to(full_name)`).order('created_at', { ascending: false }),
        { errorMessage: 'Projeler yüklenirken hata oluştu', timeoutMs: 15000 }
      );
      if (error) throw error;
      setProjects(data || []);
    } catch (error) { setLoadError(true); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (project, newStatus) => {
    setUpdatingId(project.id);
    try {
      const { error } = await safeQuery(
        () => supabase.from('projects').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', project.id),
        { errorMessage: 'Durum güncellenemedi.' }
      );
      if (error) throw error;
      toast({ title: "Durum Güncellendi", description: `Proje durumu: ${translateStatus(newStatus)}` });
      fetchProjects();
    } catch (error) { } finally { setUpdatingId(null); }
  };

  const submitRevision = async (projectId, note) => {
     try {
         const { error } = await safeQuery(
             () => supabase.from('projects').update({ 
                status: 'Revize', revision_notes: note, revision_requested: true,
                revision_status: 'pending', revision_count: (revisionProject.revision_count || 0) + 1,
                updated_at: new Date().toISOString() 
             }).eq('id', projectId),
             { errorMessage: 'Revize talebi kaydedilemedi.' }
         );
         if (error) throw error;
         
         // Notification is secondary, can fail silently
         await supabase.from('notifications').insert({
                user_id: revisionProject.assigned_to, type: 'revize_talep',
                message: `Revize talep edildi: ${note.substring(0, 50)}... - ${revisionProject.brand}`,
                related_project_id: projectId, read: false
         });

         toast({ title: "Başarılı", description: "Revize talebi iletildi." });
         setIsRevisionOpen(false);
         fetchProjects();
     } catch (err) { }
  };

  const handleRevisionRequest = (project) => { setRevisionProject(project); setIsRevisionOpen(true); };
  const isDesigner = user?.role === 'designer';
  const getDriveLink = (brand) => `https://drive.google.com/drive/search?q=parent:1M_k4e1LRPPNnQYR-faswon1NczzEg9Hd%20${encodeURIComponent(brand || '')}`;

  const filteredProjects = projects.filter(p => (p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || p.fair_event?.toLowerCase().includes(searchTerm.toLowerCase())));
  const displayedProjects = activeTab === 'revision_pending' ? filteredProjects.filter(p => p.revision_requested === true) : filteredProjects;
  const revisionCount = projects.filter(p => p.revision_requested === true).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0A0A0A] p-6 rounded-lg border border-white/10 shadow-xl">
        <div><h1 className="text-2xl font-bold text-white mb-1">Tasarım Kordinasyonu</h1><p className="text-zinc-400 text-sm">Tüm projeleri görüntüleyin ve yönetin.</p></div>
        <div className="flex gap-2">
            {!isDesigner && (<Button asChild variant="default" className="bg-[#FF6200] hover:bg-[#FF8000] text-white"><a href="https://drive.google.com" target="_blank" rel="noopener noreferrer"><Upload className="mr-2 h-4 w-4" /> Proje Yükle</a></Button>)}
            <Button variant="outline" onClick={fetchProjects}><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
             <TabsList className="bg-[#121212] border border-white/10">
                 <TabsTrigger value="all" className="data-[state=active]:bg-[#FF6200] data-[state=active]:text-white">Tüm Projeler</TabsTrigger>
                 <TabsTrigger value="revision_pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white relative">Revize Bekleyen {revisionCount > 0 && (<span className="ml-2 bg-white text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{revisionCount}</span>)}</TabsTrigger>
             </TabsList>
        </Tabs>
        <div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="Proje veya fuar ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-[#121212] border-white/10 text-white placeholder:text-zinc-600 focus:ring-blue-500/50" /></div>
      </div>

      <div className="rounded-md border border-white/10 bg-[#0A0A0A]/50 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
              <TableHead className="text-zinc-400 font-semibold w-[25%]">Proje Detayları</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Marka</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Fuar</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Tarih</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Durum</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold pr-6">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (<TableRow><TableCell colSpan={6} className="h-48 text-center text-zinc-500"><div className="flex flex-col items-center justify-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /><span className="text-lg animate-pulse">Yükleniyor...</span></div></TableCell></TableRow>) 
            : loadError ? (<TableRow><TableCell colSpan={6} className="h-32 text-center text-red-500"><div className="flex flex-col items-center justify-center gap-2"><span>Hata oluştu. Lütfen sayfayı yenilein.</span><Button variant="outline" onClick={fetchProjects} className="mt-2">Tekrar Dene</Button></div></TableCell></TableRow>) 
            : displayedProjects.length === 0 ? (<TableRow><TableCell colSpan={6} className="h-32 text-center text-zinc-500">Proje bulunamadı.</TableCell></TableRow>) 
            : (displayedProjects.map((project) => {
                const isBriefOwner = user?.id === project.created_by;
                const isRevisionRequested = project.revision_requested === true;

                return (
                  <TableRow key={project.id} id={`project-row-${project.id}`} className={`border-white/5 hover:bg-white/5 transition-colors group ${isRevisionRequested ? 'bg-blue-900/10' : ''}`}>
                    <TableCell className="py-4 align-top w-[25%]">
                        {isRevisionRequested ? (<div className="flex items-center h-full"><RevisionRequestCard project={project} onUpdate={fetchProjects} /></div>) : (<div className="text-zinc-500 text-sm italic py-2">Revize yok.</div>)}
                    </TableCell>
                    <TableCell className="font-medium text-white text-base py-4 align-top">{project.brand}</TableCell>
                    <TableCell className="text-zinc-300 py-4 align-top">{project.fair_event}</TableCell>
                    <TableCell className="text-zinc-400 text-sm py-4 align-top">{project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy', { locale: tr }) : '-'}</TableCell>
                    <TableCell className="py-4 align-top">
                      <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(project.status)}`}>{translateStatus(project.status)}</Badge>
                      {isRevisionRequested && (<div className="flex items-center gap-1 mt-2 text-blue-500 text-xs font-semibold animate-pulse"><AlertCircle className="w-3 h-3" /> Revize Bekliyor</div>)}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6 align-top">
                      <CardButtonGroup className="mt-0 pt-0 border-t-0 min-w-[200px] max-w-[200px] ml-auto">
                          <div className="grid grid-cols-2 gap-2">
                              <CardButton variant="secondary" className="h-9 px-2 text-xs" icon={Eye} onClick={() => { setSelectedProjectForView(project); setIsViewModalOpen(true); }}>Detay</CardButton>
                              {!isDesigner && (<CardButton asChild variant="secondary" className="h-9 px-2 text-xs"><a href={getDriveLink(project.brand)} target="_blank" rel="noopener noreferrer"><Briefcase className="h-3.5 w-3.5 mr-1" /> Görüntüle</a></CardButton>)}
                          </div>
                          {project.status !== 'completed' && project.status !== 'started' && (<CardButton variant="primary" className="h-9 text-xs" icon={Play} onClick={() => handleStatusUpdate(project, 'started')} loading={updatingId === project.id} disabled={updatingId === project.id}>Başla</CardButton>)}
                          {project.status === 'started' && (<CardButton variant="primary" className="h-9 text-xs bg-green-600 hover:bg-green-700" icon={Check} onClick={() => handleStatusUpdate(project, 'completed')} loading={updatingId === project.id} disabled={updatingId === project.id}>Tamamla</CardButton>)}
                          {isBriefOwner && !isRevisionRequested && (<CardButton variant="danger" className="h-9 text-xs" icon={RotateCcw} onClick={() => handleRevisionRequest(project)}>Revize İste</CardButton>)}
                          {isRevisionRequested && (<CardButton variant="ghost" className="h-9 text-xs opacity-50 cursor-not-allowed" icon={AlertCircle} disabled>Revize Aktif</CardButton>)}
                      </CardButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} project={selectedProjectForView} />
      <RevisionRequestDialog isOpen={isRevisionOpen} onClose={() => setIsRevisionOpen(false)} onSubmit={submitRevision} project={revisionProject} />
    </div>
  );
}
