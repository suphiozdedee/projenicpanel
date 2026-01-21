
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Send, DollarSign, Euro, PoundSterling, Wallet } from 'lucide-react';

export default function SendQuoteDialog({ isOpen, onClose, quote, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [prices, setPrices] = useState({
    tl: '',
    eur: '',
    usd: '',
    gbp: ''
  });
  
  const { toast } = useToast();

  const handlePriceChange = (currency, value) => {
    setPrices(prev => ({
      ...prev,
      [currency]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one price
    if (!prices.tl && !prices.eur && !prices.usd && !prices.gbp) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir para biriminde fiyat giriniz."
      });
      return;
    }

    setSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      
      // Update Quote
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'sent',
          price_tl: prices.tl || null,
          price_eur: prices.eur || null,
          price_usd: prices.usd || null,
          price_gbp: prices.gbp || null,
          updated_at: timestamp
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // Find Brief Owner to notify
      const { data: briefData } = await supabase
        .from('projects')
        .select('created_by, brand')
        .eq('id', quote.brief_id)
        .single();

      if (briefData) {
        // Create Notification
        await supabase
          .from('notifications')
          .insert({
            user_id: briefData.created_by,
            type: 'quote_sent',
            message: `Teklif gönderildi: ${briefData.brand}`,
            brief_id: quote.brief_id,
            quote_id: quote.id,
            read: false,
            created_at: timestamp
          });
      }

      toast({
        title: "Başarılı",
        description: "Teklif başarıyla gönderildi.",
        className: "bg-green-600 text-white"
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teklif gönderilirken bir hata oluştu."
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-500" />
            Teklif Ver
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            <span className="text-white font-medium">"{quote.brief?.brand}"</span> için fiyat teklifinizi giriniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price-tl" className="text-xs uppercase text-zinc-500 font-bold tracking-wider">Türk Lirası (₺)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₺</span>
              <Input
                id="price-tl"
                type="number"
                placeholder="0.00"
                value={prices.tl}
                onChange={(e) => handlePriceChange('tl', e.target.value)}
                className="pl-8 bg-emerald-950/20 border-emerald-500/30 text-white focus:ring-emerald-500/50"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price-eur" className="text-[10px] uppercase text-zinc-500 font-bold">Euro (€)</Label>
              <div className="relative">
                <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  id="price-eur"
                  type="number"
                  placeholder="0"
                  value={prices.eur}
                  onChange={(e) => handlePriceChange('eur', e.target.value)}
                  className="pl-8 bg-[#0A0A0A] border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price-usd" className="text-[10px] uppercase text-zinc-500 font-bold">USD ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  id="price-usd"
                  type="number"
                  placeholder="0"
                  value={prices.usd}
                  onChange={(e) => handlePriceChange('usd', e.target.value)}
                  className="pl-8 bg-[#0A0A0A] border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-gbp" className="text-[10px] uppercase text-zinc-500 font-bold">GBP (£)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  id="price-gbp"
                  type="number"
                  placeholder="0"
                  value={prices.gbp}
                  onChange={(e) => handlePriceChange('gbp', e.target.value)}
                  className="pl-8 bg-[#0A0A0A] border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-white/5">
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Teklifi Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
