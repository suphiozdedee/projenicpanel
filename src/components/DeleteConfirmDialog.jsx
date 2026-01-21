
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteConfirmDialog({ isOpen, onClose, onSuccess, user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'deleteUser',
          payload: { userId: user.id }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Başarılı", description: "Kullanıcı silindi." });
      onSuccess();
    } catch (error) {
      console.error("Delete error:", error);
      toast({ 
        variant: "destructive", 
        title: "Hata", 
        description: error.message || "Silme işlemi başarısız." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Sil</DialogTitle>
          <DialogDescription className="text-zinc-400">
            <strong>{user?.full_name}</strong> adlı kullanıcıyı silmek istediğinize emin misiniz? 
            Bu işlem geri alınamaz ve kullanıcının sisteme erişimi kesilir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300"
          >
            İptal
          </Button>
          <Button 
            variant="destructive"
            onClick={(e) => { e.preventDefault(); handleDelete(); }} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
