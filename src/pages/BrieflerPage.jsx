import React, { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, PlusCircle, Loader2, RotateCcw, Send, Briefcase, Eye, FileText, Download, 
  Paperclip, ChevronDown, ChevronUp, Building2, Pencil, Timer, AlertTriangle, RefreshCw, X, WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import BriefDetailDialog from '@/components/BriefDetailDialog';
import RevisionRequestDialog from '@/components/RevisionRequestDialog';
import EditBriefDialog from '@/components/EditBriefDialog';
import DeleteBriefDialog from '@/components/DeleteBriefDialog';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { safeQuery } from '@/lib/networkUtils';
import { withErrorHandling } from '@/lib/errorHandler';
import { translateStatus, getStatusColor } from '@/lib/statusTranslations';
import { testConnection } from '@/lib/supabaseConnectionTest';

const getCategoryLabel = (key) => {
    switch(key) {
       case 'incoming_email': return 'Gelen Mail';
       case 'floor_plan': return 'Alan Planı';
       case 'logo': return 'Logo';
       case 'product_images': return 'Ürün Görselleri';
       case 'previous_stand': return 'Eski Stand';
       case 'design_examples': return 'Örnekler';
       default: return 'Diğer';
    }
};

export const formatNumberInput = (value) => {
  if (!value) return '';
  const rawValue = value.replace(/\D/g, '');
  if (!rawValue) return '';
  return new Intl.NumberFormat('tr-TR').format(rawValue);
};

function ProjectFilesList({ filesByCategory }) {
    const [isOpen, setIsOpen] = useState(false);
    const fileCount = Object.values(filesByCategory).flat().length;
    if (fileCount === 0) return null;
    return (
        <div className="pt-3 border-t border-white/10 mt-2">
             <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} className="w-full flex items-center justify-between group p-1.5 -ml-1.5 rounded hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors tracking-wide">
                    <Paperclip className="w-3.5 h-3.5" />
                    Dosyalar ({fileCount})
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
            {isOpen && (
                <div className="flex flex-col gap-2 pl-1 mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                    {Object.entries(filesByCategory).map(([catKey, files]) => (
                        <div key={catKey} className="space-y-1">
                            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{getCategoryLabel(catKey)}</div>
                            <div className="flex flex-col gap-1">{files.map((file, idx) => (
                                    <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-1.5 rounded bg-[#181818] border border-white/10 hover:border-blue-500/50 hover:bg-[#202020] transition-all group/file overflow-hidden shadow-sm" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        <FileText className="w-3 h-3 text-zinc-400 group-hover/file:text-blue-400 transition-colors shrink-0" />
                                        <span className="text-[10px] text-zinc-200 truncate max-w-full group-hover/file:text-white transition-colors leading-relaxed font-medium">{file.name}</span>
                                    </div>
                                    <Download className="w-3 h-3 text-zinc-500 group-hover/file:text-blue-400 transition-colors shrink-0 ml-1" />
                                    </a>
                            ))}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const CountdownBadge = ({ targetDate }) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = parseISO(targetDate);
    const diffDays = differenceInCalendarDays(target, today);
    let label = "", colorClass = "", Icon = Timer;
    if (diffDays < 0) { label = "Geçmiş"; colorClass = "bg-red-500/10 text-red-300 border-red-500/20"; Icon = AlertTriangle; } 
    else if (diffDays === 0) { label = "Bugün"; colorClass = "bg-red-500/10 text-red-300 border-red-500/20"; Icon = AlertTriangle; } 
    else {
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        label = months > 0 ? `${months} ay ${remainingDays} gün` : `${remainingDays} gün`;
        colorClass = diffDays <= 7 ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    }
    return (<Badge variant="outline" className={cn("flex items-center gap-1.5 border px-2 py-0.5 text-xs rounded-sm font-semibold shadow-sm backdrop-blur-sm h-7 tracking-wide", colorClass)}><Icon className="w-3.5 h-3.5" /> {label}</Badge>);
};

export default function BrieflerPage() {
  const { user } = useAuth();
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [revisionProject, setRevisionProject] = useState(null);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBriefForDelete, setSelectedBriefForDelete] = useState(null);
  
  // Connection State
  const [connectionStatus, setConnectionStatus] = useState({ tested: false, success: true, message: '' });
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Action Loading States
  const [actionLoading, setActionLoading] = useState(null);

  const isDesigner = user?.role === 'designer';

  // Perform connection test on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
      setIsRetrying(true);
      const result = await testConnection();
      setConnectionStatus({ tested: true, ...result });
      setIsRetrying(false);
  };

  // Optimized Fetcher
  const fetchProjects = useCallback(() => {
    return safeQuery(
        () => supabase
            .from('projects')
            .select(`
                id, brand, fair_event, city, start_date, end_date, stand_type, 
                status, created_at, created_by, assigned_to, 
                created_by_username, description, square_meters, 
                price, file_urls, currency, budget,
                assigned_to_user:assigned_to(id, full_name, email), 
                created_by_user:created_by(id, full_name, email)
            `)
            .order('created_at', { ascending: false }),
        { 
            timeoutMs: 15000,
            errorMessage: 'Projeler yüklenirken bir hata oluştu.',
            errorTitle: 'Veri Yükleme Hatası',
            ttl: 30000 
        }
    );
  }, []);

  const { data: projects, loading, error: loadError, refresh, setData: setProjects } = useLazyLoad(fetchProjects);

  const handleCreateSuccess = async () => { refresh(); setIsCreateOpen(false); };
  const handleEditSuccess = () => { refresh(); setIsEditOpen(false); setIsDetailOpen(false); };
  const handleOpenDetails = (project) => { setSelectedProject({ ...project }); setIsDetailOpen(true); };
  const handleEditProject = (project) => { setProjectToEdit(project); setIsEditOpen(true); };
  
  const handleDeleteClick = (project) => { 
      setSelectedBriefForDelete(project); 
      setIsDeleteDialogOpen(true); 
  };
  
  const handleDeleteSuccess = (deletedId) => {
      // Optimistic update: remove locally immediately
      setProjects(prev => prev.filter(p => p.id !== deletedId));
      setSelectedBriefForDelete(null);
      // Then re-fetch to ensure consistency
      refresh();
  };

  const handleRevisionRequest = (project) => { setRevisionProject(project); setIsRevisionOpen(true); };
  
  const submitRevision = async (projectId, note) => {
     await withErrorHandling(
        () => supabase.from('projects').update({ status: 'Revize', revision_notes: note, revision_requested: true, updated_at: new Date().toISOString() }).eq('id', projectId),
        null, 
        "Revize Talebi",
        () => {
            setIsRevisionOpen(false);
            refresh();
        },
        { showSuccessToast: true, successMessage: "Revize talebi başarıyla iletildi." }
     );
  };

  const handleRequestQuote = async (projectId) => {
      setActionLoading(projectId);
      await withErrorHandling(
        () => supabase.from('projects').update({ status: 'Teklif Bekliyor', updated_at: new Date().toISOString() }).eq('id', projectId),
        (isLoading) => !isLoading && setActionLoading(null),
        "Teklif Talebi",
        () => refresh(),
        { showSuccessToast: true, successMessage: "Teklif talebi başarıyla oluşturuldu." }
      );
  };
  
  const getDriveLink = (brand) => {
    const brandTerm = encodeURIComponent(brand || '');
    return `https://drive.google.com/drive/search?q=parent:1M_k4e1LRPPNnQYR-faswon1NczzEg9Hd%20${brandTerm}`;
  };

  return (
    <div className="space-y-8 pb-20 pt-4 px-0 sm:px-4 md:px-0 max-w-[1600px] mx-auto">
      
      {/* Connection Error Banner */}
      {connectionStatus.tested && !connectionStatus.success && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <div className="text-sm">
                      <p className="text-white font-medium">Bağlantı Hatası</p>
                      <p className="text-red-400">{connectionStatus.message}</p>
                      {connectionStatus.error && <p className="text-xs text-red-500/70 mt-1 font-mono">{connectionStatus.error}</p>}
                  </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnection}
                disabled={isRetrying}
                className="border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300"
              >
                {isRetrying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Tekrar Dene
              </Button>
          </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 p-6 rounded-xl shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-wide leading-tight">Briefler & Projeler</h1>
          <p className="text-zinc-300 text-sm mt-2 font-medium tracking-wide">Tüm proje süreçlerini ve detaylarını buradan yönetin.</p>
        </div>
        {!isDesigner && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white w-full sm:w-auto hover:bg-blue-700 shadow-lg shadow-blue-900/20 font-medium tracking-wide">
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Proje
          </Button>
        )}
      </div>

      {loading && projects.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
      ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <p className="text-zinc-300 font-medium">Veriler yüklenemedi.</p>
              <Button variant="outline" onClick={refresh} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className="mr-2 h-4 w-4" /> Yeniden Dene</Button>
          </div>
      ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                {projects.map((project) => {
                    let filesByCategory = {};
                    if (project.file_urls && typeof project.file_urls === 'object') Object.entries(project.file_urls).forEach(([key, files]) => { if (Array.isArray(files) && files.length > 0) filesByCategory[key] = files; });
                    
                    const canEdit = !isDesigner && (user?.role === 'admin' || user?.id === project.created_by);
                    const isProcessing = actionLoading === project.id;

                    return (
                        <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        >
                            <div className="group relative flex flex-col h-[28rem] bg-[#0A0A0A]/60 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/40">
                                
                                {/* Delete Button - Absolute Top Right */}
                                {canEdit && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(project); }}
                                        disabled={isProcessing}
                                        className="absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow-xl border border-red-400/50 cursor-pointer hover:bg-red-600 hover:scale-110 transition-all duration-300"
                                        title="Brief'i Sil"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Header Section */}
                                <div className="p-5 pb-3 shrink-0 bg-gradient-to-b from-white/5 to-transparent">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="space-y-2 flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold tracking-normal text-white truncate leading-snug drop-shadow-sm" title={project.brand}>
                                                    {project.brand}
                                                </h3>
                                                {canEdit && (
                                                     <button 
                                                        onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                                                        className="text-zinc-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                                                     >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                     </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={cn("px-2 py-0.5 text-xs font-bold h-7 border-none tracking-wide", getStatusColor(project.status))}>
                                                    {translateStatus(project.status)}
                                                </Badge>
                                                <CountdownBadge targetDate={project.start_date} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 px-5 py-2 space-y-4 overflow-hidden">
                                    <div className="grid grid-cols-1 gap-3">
                                         {/* Improved Fair Name Display */}
                                         <div className="flex items-start gap-2.5 text-zinc-400" title={project.fair_event}>
                                            <Building2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-zinc-200 leading-relaxed line-clamp-2 break-words tracking-wide">
                                                {project.fair_event || '-'}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-2.5 text-zinc-400" title={project.city}>
                                            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                                            <span className="text-xs text-zinc-300 font-medium tracking-wide truncate">{project.city || '-'}</span>
                                         </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="bg-[#151515] p-2.5 rounded-lg border border-white/5 shadow-inner">
                                            <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1 tracking-widest">Oluşturan</div>
                                            <div className="text-zinc-200 truncate text-xs font-semibold tracking-wide">{project.created_by_username || 'A'}</div>
                                        </div>
                                        <div className="bg-[#151515] p-2.5 rounded-lg border border-white/5 shadow-inner">
                                            <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1 tracking-widest">Atanan</div>
                                            <div className="text-blue-400 truncate text-xs font-semibold tracking-wide">{project.assigned_to_user?.full_name || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden">
                                        <ProjectFilesList filesByCategory={filesByCategory} />
                                    </div>
                                </div>
                                    
                                {/* Footer Section - Buttons */}
                                <div className="p-4 mt-auto bg-[#0A0A0A]/80 border-t border-white/10 shrink-0 backdrop-blur-md">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex gap-2.5">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="flex-1 h-9 text-xs font-medium bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200 tracking-wide hover:text-white hover:border-white/20 transition-all"
                                                onClick={() => handleOpenDetails(project)} 
                                                disabled={isProcessing}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-2" /> Detay
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-9 text-xs font-medium bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200 tracking-wide hover:text-white hover:border-white/20 transition-all"
                                                onClick={() => window.open(getDriveLink(project.brand), '_blank')} 
                                                disabled={isProcessing}
                                            >
                                                <Briefcase className="w-3.5 h-3.5 mr-2" /> Drive
                                            </Button>
                                        </div>

                                        {!isDesigner && (
                                            <div className="flex gap-2.5">
                                                {(!project.price && !['Teklif Bekliyor', 'Teklif Verildi', 'Onaylandı'].includes(project.status)) ? (
                                                    <Button 
                                                        size="sm"
                                                        className="flex-1 h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white tracking-wide shadow-md shadow-blue-900/10"
                                                        onClick={() => handleRequestQuote(project.id)}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-2" /> Teklif İste</>}
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        size="sm"
                                                        variant="ghost"
                                                        className="flex-1 h-9 text-xs font-medium text-zinc-500 cursor-default hover:bg-transparent tracking-wide"
                                                    >
                                                        Teklif Sürecinde
                                                    </Button>
                                                )}
                                                
                                                <Button 
                                                    size="sm"
                                                    variant="destructive"
                                                    className="w-9 h-9 px-0 shrink-0 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-sm"
                                                    onClick={() => handleRevisionRequest(project)}
                                                    disabled={isProcessing}
                                                    title="Revize İste"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>
      )}
      {!isDesigner && <CreateProjectDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />}
      <BriefDetailDialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} project={selectedProject} onEdit={() => handleEditProject(selectedProject)} />
      {!isDesigner && <RevisionRequestDialog isOpen={isRevisionOpen} onClose={() => setIsRevisionOpen(false)} onSubmit={submitRevision} project={revisionProject} />}
      {!isDesigner && <EditBriefDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} project={projectToEdit} onSuccess={handleEditSuccess} />}
      
      <DeleteBriefDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={setIsDeleteDialogOpen} 
        brief={selectedBriefForDelete} 
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}