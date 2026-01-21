
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import SketchButton from '@/components/SketchButton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, FileText, Paperclip, Download, UserPlus, Pencil, Send } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function BriefDetailDialog({ isOpen, onClose, project, onEdit }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!project) return null;

  let fileCategories = {};
  if (project.file_urls) {
    const files = typeof project.file_urls === 'object' ? project.file_urls : {};
    Object.keys(files).forEach(key => { if (Array.isArray(files[key]) && files[key].length > 0) fileCategories[key] = files[key]; });
  }

  const getCategoryLabel = (key) => {
    switch(key) {
      case 'incoming_email': return 'Gelen Mailler';
      case 'floor_plan': return 'Alan Planı';
      case 'logo': return 'Logo';
      case 'product_images': return 'Ürün Görselleri';
      case 'previous_stand': return 'Eski Standlar';
      case 'design_examples': return 'Tasarım Örnekleri';
      default: return 'Diğer Dosyalar';
    }
  };

  const isDesigner = user?.role === 'designer';
  const canManage = !isDesigner && (user?.role === 'admin' || user?.id === project.created_by);

  const handleNavigateToQuotes = () => {
    onClose();
    navigate('/quotes');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-[#FF6200]" /> {project.brand || project.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <SketchButton variant="ghost" size="sm" onClick={onEdit} className="h-8 border-zinc-700 text-zinc-400 hover:text-white"><Pencil className="w-3 h-3 mr-2" /> Düzenle</SketchButton>
              <Badge variant="outline" className="border-[#FF6200] text-[#FF6200] text-xs">{project.status}</Badge>
            </div>
          </div>
          <DialogDescription className="text-zinc-400 text-sm">Proje brief detayları ve yüklenen dosyalar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-zinc-500 text-[11px] uppercase tracking-wider">İş Türü</Label><div className="flex items-center gap-2 text-xs font-medium"><Building2 className="w-4 h-4 text-zinc-400" />{project.work_type || project.stand_type || '-'}</div></div>
            <div className="space-y-1"><Label className="text-zinc-500 text-[11px] uppercase tracking-wider">Talep Edilen</Label><div className="text-xs font-medium">{project.requested_project_type || project.stand_type || '-'}</div></div>
            <div className="space-y-1"><Label className="text-zinc-500 text-[11px] uppercase tracking-wider">Fuar</Label><div className="text-base font-medium">{project.fair_event || '-'}</div></div>
            <div className="space-y-1"><Label className="text-zinc-500 text-[11px] uppercase tracking-wider">Oluşturan</Label><div className="flex items-center gap-2 text-xs font-medium"><UserPlus className="w-4 h-4 text-zinc-400" />{project.created_by_username || 'Bilinmiyor'}</div></div>
            <div className="space-y-1"><Label className="text-zinc-500 text-[11px] uppercase tracking-wider">Temsilci</Label><div className="flex items-center gap-2 text-xs font-medium"><User className="w-4 h-4 text-zinc-400" />{project.assigned_to_user?.full_name || '-'}</div></div>
          </div>
          <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50 space-y-3">
            <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-[#FF6200] mt-1" /><div><Label className="text-zinc-500 text-[11px] uppercase">Konum</Label><div className="text-sm text-zinc-200">{project.city || project.location || 'Belirtilmedi'}</div></div></div>
            <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-[#FF6200] mt-1" /><div><Label className="text-zinc-500 text-[11px] uppercase">Tarih Aralığı</Label><div className="text-xs text-zinc-200">{project.start_date ? format(new Date(project.start_date), 'd MMMM', {locale: tr}) : '?'} {' - '} {project.end_date ? format(new Date(project.end_date), 'd MMMM yyyy', {locale: tr}) : '?'}</div></div></div>
          </div>
          <div className="space-y-3">
            <Label className="text-zinc-500 text-[11px] uppercase tracking-wider flex items-center gap-2"><Paperclip className="w-3 h-3" /> Proje Dosyaları</Label>
            {Object.keys(fileCategories).length === 0 ? (<div className="text-xs text-zinc-500 italic bg-zinc-900/50 p-3 rounded border border-zinc-800 border-dashed text-center">Bu projeye ait dosya yüklenmemiş.</div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(fileCategories).map(([category, files]) => (
                  <div key={category} className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3">
                    <h4 className="text-[11px] font-semibold text-zinc-300 mb-2 border-b border-zinc-800 pb-1">{getCategoryLabel(category)}</h4>
                    <div className="space-y-1">
                      {files.map((file, idx) => (
                        <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group p-1.5 hover:bg-zinc-800 rounded transition-colors"><div className="flex items-center gap-2 overflow-hidden"><FileText className="w-3 h-3 text-zinc-500" /><span className="text-[10px] text-zinc-400 truncate max-w-[150px] group-hover:text-white" title={file.name}>{file.name}</span></div><Download className="w-3 h-3 text-zinc-600 group-hover:text-[#FF6200]" /></a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {project.description && (<div className="space-y-2">
            <Label className="text-zinc-500 text-[11px] uppercase tracking-wider">Notlar / Açıklama</Label>
            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/20 p-3 rounded-md border border-zinc-800/50 max-h-[150px] overflow-y-auto whitespace-pre-wrap">{project.description}</div>
          </div>)}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canManage && (
            <Button 
              variant="default" 
              className="w-full sm:w-auto bg-[#FF6200] hover:bg-[#FF8000] text-white font-bold tracking-wide shadow-lg shadow-orange-900/20 text-sm"
              onClick={handleNavigateToQuotes}
            >
              <Send className="mr-2 h-4 w-4" />
              Teklif Oluştur (Teklifler Sayfası)
            </Button>
          )}
          <SketchButton onClick={onClose} variant="secondary" className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white text-sm">
            Kapat
          </SketchButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
