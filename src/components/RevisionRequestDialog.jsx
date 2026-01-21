
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

export default function RevisionRequestDialog({ isOpen, onClose, onSubmit, project }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note || note.length < 10) return;
    
    setLoading(true);
    try {
      await onSubmit(project.id, note);
      setNote('');
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#121212] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <RotateCcw className="w-5 h-5" />
            <DialogTitle className="text-xl">Revize Talebi Oluştur</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            {project?.brand} markası için revize detaylarını giriniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="revision-note" className="text-zinc-200">
              Revize Açıklaması
            </Label>
            <Textarea
              id="revision-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ne değişmesini istiyorsun? Detaylı açıkla..."
              className="bg-black/50 border-white/10 min-h-[150px] text-white placeholder:text-zinc-600 focus:border-orange-500/50"
            />
            <p className="text-xs text-zinc-500 text-right">
              {note.length}/10 karakter (Minimum 10)
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-white/5"
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={note.length < 10 || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
