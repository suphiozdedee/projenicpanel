import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  User, 
  Ruler, 
  HardDrive, 
  FileText, 
  ExternalLink,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProjectViewModal({ isOpen, onClose, project }) {
  if (!project) return null;

  const getDriveLink = (brand) => {
    // If presentation_url exists, use it, otherwise fallback to search
    if (project.presentation_url) return project.presentation_url;

    const parentFolderId = '1M_k4e1LRPPNnQYR-faswon1NczzEg9Hd';
    const brandTerm = encodeURIComponent(brand || '');
    return `https://drive.google.com/drive/search?q=parent:${parentFolderId}%20${brandTerm}`;
  };

  const driveLink = getDriveLink(project.brand);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
      case 'Onaylandı':
      case 'Tamamlandı':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'started':
      case 'Tasarıma Başlandı':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Revize':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'started') return 'Projeye Başlandı';
    if (status === 'completed') return 'Proje Bitti';
    return status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {project.brand}
                <Badge className={`text-sm px-2 py-0.5 border ${getStatusBadgeVariant(project.status)}`}>
                  {getStatusLabel(project.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 flex items-center gap-2">
                <span className="font-medium text-zinc-300">{project.fair_event}</span>
                {project.stand_type && (
                   <>• <span className="text-zinc-500">{project.stand_type}</span></>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column: Project Details */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-200">
                <Info className="w-5 h-5 text-orange-500" />
                Proje Detayları
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 w-24">Tarih:</span>
                  <span className="text-zinc-200">
                    {project.start_date ? format(new Date(project.start_date), 'd MMMM yyyy', { locale: tr }) : '-'}
                     {' - '}
                    {project.end_date ? format(new Date(project.end_date), 'd MMMM yyyy', { locale: tr }) : '-'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 w-24">Konum:</span>
                  <span className="text-zinc-200">
                    {project.city}{project.fair_area ? `, ${project.fair_area}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 w-24">Alan (m²):</span>
                  <span className="text-zinc-200 font-mono">
                    {project.square_meters ? `${project.square_meters} m²` : '-'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 w-24">Sorumlu:</span>
                  <span className="text-zinc-200">
                    {project.assignee?.full_name || 'Atanmadı'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 w-24">Oluşturan:</span>
                  <span className="text-zinc-200">
                    {project.creator?.full_name || project.created_by_username || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Hızlı İşlemler</h3>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 bg-zinc-900/50 hover:bg-zinc-800 border-zinc-700 text-zinc-300"
                  asChild
                >
                  <a href={driveLink} target="_blank" rel="noopener noreferrer">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    Drive Klasörünü Aç
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                </Button>
            </div>
          </div>

          {/* Right Column: Briefs & Description */}
          <div className="space-y-6">
             <div className="bg-white/5 rounded-xl p-4 border border-white/5 h-full flex flex-col">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-200 mb-4">
                <FileText className="w-5 h-5 text-orange-500" />
                Briefler & Notlar
              </h3>
              
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {project.description ? (
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Açıklama</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                ) : (
                   <p className="text-zinc-500 text-sm italic">Herhangi bir açıklama girilmemiş.</p>
                )}

                {/* Additional metadata could go here like revision notes if needed */}
                {project.revision_requested && project.revision_notes && (
                   <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                    <span className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1 block">Son Revize Notu</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {project.revision_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}