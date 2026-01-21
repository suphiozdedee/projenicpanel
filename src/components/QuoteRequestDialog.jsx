
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Placeholder Component since Quotes are now Local State
export default function QuoteRequestDialog({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Bilgi</DialogTitle>
          <DialogDescription className="text-zinc-400">
             Teklif sistemi güncellendi. Lütfen "Teklifler" sayfasını kullanarak yerel teklifler oluşturun.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="bg-white/10 hover:bg-white/20">Tamam</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
