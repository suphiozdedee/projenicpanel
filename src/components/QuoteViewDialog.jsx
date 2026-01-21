import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, CheckCircle2, XCircle, FileText, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function QuoteViewDialog({ isOpen, onClose, briefId }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && briefId) {
      loadQuotes();
    }
  }, [isOpen, briefId]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          manager:manager_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('brief_id', briefId)
        .neq('status', 'pending'); // Show only responded quotes usually, or all

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quote, newStatus) => {
    setProcessing(quote.id);
    try {
      // 1. Update this quote
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quote.id);

      if (error) throw error;

      // 2. Notify manager
      await supabase
        .from('notifications')
        .insert({
          user_id: quote.manager_id,
          type: 'quote_status_update',
          message: `Teklifiniz ${newStatus === 'accepted' ? 'kabul edildi' : 'reddedildi'}: Project ID ${briefId}`,
          quote_id: quote.id,
          brief_id: briefId,
          read: false
        });
      
      // Update local state
      setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: newStatus } : q));

      toast({
        title: "Durum Güncellendi",
        description: `Teklif başarıyla ${newStatus === 'accepted' ? 'kabul edildi' : 'reddedildi'}.`,
        className: newStatus === 'accepted' ? "bg-green-600 text-white" : "bg-red-600 text-white"
      });

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu."
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (amount, currency) => {
    if (!amount) return null;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Gelen Teklifler
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
             Bu proje için alınan fiyat teklifleri.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/30 rounded-lg border border-white/5 border-dashed">
              <p className="text-zinc-500">Henüz cevaplanmış veya gönderilmiş teklif yok.</p>
            </div>
          ) : (
            quotes.map(quote => (
              <div key={quote.id} className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 space-y-3 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                       {quote.manager?.raw_user_meta_data?.full_name?.[0] || 'Y'}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">
                        {quote.manager?.raw_user_meta_data?.full_name || quote.manager?.email || 'Yönetici'}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {quote.updated_at ? format(new Date(quote.updated_at), 'd MMM yyyy, HH:mm', { locale: tr }) : '-'}
                      </div>
                    </div>
                  </div>
                  <Badge className={`
                    ${quote.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                    ${quote.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                    ${quote.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                    uppercase text-[10px] tracking-wider
                  `}>
                    {quote.status === 'accepted' ? 'Kabul Edildi' : 
                     quote.status === 'rejected' ? 'Reddedildi' : 
                     quote.status === 'sent' ? 'Teklif Verildi' : 'Beklemede'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-black/20 p-3 rounded border border-white/5">
                    {quote.price_tl && <div className="text-sm font-mono text-emerald-400">{formatPrice(quote.price_tl, 'TRY')}</div>}
                    {quote.price_eur && <div className="text-sm font-mono text-zinc-300">{formatPrice(quote.price_eur, 'EUR')}</div>}
                    {quote.price_usd && <div className="text-sm font-mono text-zinc-300">{formatPrice(quote.price_usd, 'USD')}</div>}
                    {quote.price_gbp && <div className="text-sm font-mono text-zinc-300">{formatPrice(quote.price_gbp, 'GBP')}</div>}
                    {(!quote.price_tl && !quote.price_eur && !quote.price_usd && !quote.price_gbp) && (
                        <span className="text-sm text-zinc-500 italic">Fiyat bilgisi girilmedi</span>
                    )}
                </div>

                {quote.status === 'sent' && (
                  <div className="flex gap-2 pt-2">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="flex-1 border-green-900/30 text-green-400 hover:bg-green-900/20 hover:text-green-300"
                       onClick={() => handleStatusChange(quote, 'accepted')}
                       disabled={!!processing}
                     >
                       {processing === quote.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-2" />}
                       Kabul Et
                     </Button>
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="flex-1 border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                       onClick={() => handleStatusChange(quote, 'rejected')}
                       disabled={!!processing}
                     >
                       {processing === quote.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 mr-2" />}
                       Reddet
                     </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}