
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteBriefDialog({ isOpen, onClose, brief, onSuccess }) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!brief?.id) return;
    
    setIsDeleting(true);
    try {
      // Deleting from 'projects' table as this is where briefs are stored in this application structure
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', brief.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Brief başarıyla silindi.",
        className: "bg-green-600 text-white border-none shadow-lg"
      });
      
      if (onSuccess) {
          // Pass the deleted ID so parent can remove it from state immediately
          onSuccess(brief.id);
      }
      onClose(false);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Silme Hatası",
        description: "Silme işlemi başarısız oldu: " + (error.message || "Bilinmeyen hata"),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && onClose(open)}>
      <DialogContent className="bg-[#0f0f0f] border-zinc-800 text-white sm:max-w-[425px] p-6 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Brief'i Sil
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm leading-relaxed tracking-wide">
            Bu briefi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilgili tüm veriler (teklifler, dosyalar) silinecektir.
          </DialogDescription>
          
          {brief?.brand && (
            <div className="bg-[#181818] p-4 rounded-lg border border-zinc-800 mt-2">
                <div className="text-xs uppercase text-zinc-500 font-bold tracking-widest mb-1">Seçilen Brief</div>
                <div className="text-white font-semibold text-base tracking-wide">
                    "{brief.brand}"
                </div>
            </div>
          )}
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
          <Button 
            variant="ghost" 
            onClick={() => onClose(false)} 
            disabled={isDeleting} 
            className="w-full sm:w-auto h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium tracking-wide transition-colors"
          >
            Vazgeç
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="w-full sm:w-auto h-10 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 font-bold tracking-wide transition-all"
          >
            {isDeleting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Siliniyor...
                </>
            ) : (
                'Evet, Sil'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
