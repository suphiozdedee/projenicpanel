import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Briefcase, Search, DollarSign, LayoutList, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import QuoteCard from '@/components/QuoteCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { safeQuery } from '@/lib/networkUtils';
import { withErrorHandling } from '@/lib/errorHandler';

const INITIAL_QUOTES = [
  { id: 1, projectId: 'p1', projectName: 'TechSummit 2024', fairName: 'CES Las Vegas', price: 15000, currency: 'USD', status: 'Onay Bekliyor', date: '2025-01-15T10:00:00Z' },
  { id: 2, projectId: 'p2', projectName: 'AutoShow Berlin', fairName: 'IFA Berlin', price: 12500, currency: 'EUR', status: 'Onaylandı', date: '2025-02-01T14:30:00Z' },
];

export default function QuotesPage() {
  const { toast } = useToast();
  
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [projects, setProjects] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    projectId: '',
    price: '',
    currency: 'TL',
    status: 'Onay Bekliyor'
  });

  const fetchProjects = async () => {
    await withErrorHandling(
      () => supabase
          .from('projects')
          .select('id, brand, fair_event')
          .order('created_at', { ascending: false }),
      setLoadingProjects,
      "Proje Listesi",
      (data) => {
         setProjects(data || []);
         setProjectsError(null);
      },
      { rethrow: false }
    );
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddQuote = async () => {
    if (!newQuote.projectId || !newQuote.price) {
      toast({ title: "Eksik Bilgi", description: "Lütfen proje seçin ve fiyat girin.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
        try {
            const selectedProject = projects.find(p => p.id === newQuote.projectId);
            const quoteToAdd = {
              id: Date.now(), 
              projectId: newQuote.projectId,
              projectName: selectedProject ? selectedProject.brand : 'Bilinmeyen Proje',
              fairName: selectedProject ? selectedProject.fair_event : '-',
              price: parseFloat(newQuote.price),
              currency: newQuote.currency,
              status: newQuote.status,
              date: new Date().toISOString()
            };
            setQuotes([quoteToAdd, ...quotes]);
            setIsCreateOpen(false);
            setNewQuote({ projectId: '', price: '', currency: 'TL', status: 'Onay Bekliyor' });
            toast({ title: "Başarılı", description: "Yeni teklif listeye eklendi.", className: "bg-green-600 text-white" });
        } catch (err) {
            toast({ title: "Hata", description: "Teklif eklenirken hata oluştu.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }, 500);
  };

  const handleUpdateQuote = (id, updates) => {
    setIsSubmitting(true);
     setTimeout(() => {
        setQuotes(quotes.map(q => q.id === id ? { ...q, ...updates } : q));
        toast({ title: "Güncellendi", description: "Teklif bilgileri güncellendi." });
        setIsSubmitting(false);
     }, 300);
  };

  const handleDeleteQuote = (id) => {
    if (window.confirm("Bu teklifi silmek istediğinize emin misiniz?")) {
       setQuotes(quotes.filter(q => q.id !== id));
       toast({ title: "Silindi", description: "Teklif listeden kaldırıldı." });
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.fairName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20 p-0 md:p-0 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#FF6200]" /> 
              Teklifler
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Verilen tüm teklifleri yönetin.
            </p>
         </div>
         <div className="relative z-10 flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                   placeholder="Proje veya Fuar Ara..." 
                   className="pl-9 h-9 bg-black/50 border-white/10 text-white text-xs"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button onClick={() => setIsCreateOpen(true)} className="bg-[#FF6200] hover:bg-[#FF8000] text-white h-9 text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Yeni Teklif
             </Button>
         </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQuotes.map(quote => (
             <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onUpdate={handleUpdateQuote} 
                onDelete={handleDeleteQuote} 
             />
          ))}
          
          {filteredQuotes.length === 0 && (
             <div className="col-span-full text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">Kayıtlı teklif bulunamadı.</p>
             </div>
          )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
         <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Yeni Teklif Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               {projectsError && (
                   <div className="p-2 bg-red-900/20 text-red-400 text-sm rounded flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4" /> Projeler yüklenemedi.
                       <Button variant="link" size="sm" className="h-auto p-0 text-red-400 underline" onClick={fetchProjects}>Tekrar Dene</Button>
                   </div>
               )}
               <div className="space-y-2">
                  <Label>Proje Seçimi {loadingProjects && <span className="text-zinc-500 text-xs">(Yükleniyor...)</span>}</Label>
                  <Select 
                     value={newQuote.projectId} 
                     onValueChange={(val) => setNewQuote({...newQuote, projectId: val})}
                     disabled={loadingProjects}
                  >
                     <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Proje Seçiniz" />
                     </SelectTrigger>
                     <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                        {projects.map(p => (
                           <SelectItem key={p.id} value={p.id}>{p.brand} - {p.fair_event}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Tutar</Label>
                     <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={newQuote.price}
                        onChange={(e) => setNewQuote({...newQuote, price: e.target.value})}
                        className="bg-zinc-900 border-zinc-700"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Birim</Label>
                     <Select 
                        value={newQuote.currency} 
                        onValueChange={(val) => setNewQuote({...newQuote, currency: val})}
                     >
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                           <SelectItem value="TL">TL</SelectItem>
                           <SelectItem value="USD">USD</SelectItem>
                           <SelectItem value="EUR">EUR</SelectItem>
                           <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>İptal</Button>
               <Button onClick={handleAddQuote} className="bg-[#FF6200] hover:bg-[#FF8000] text-white" disabled={isSubmitting}>
                   {isSubmitting ? "Ekleniyor..." : "Oluştur"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}