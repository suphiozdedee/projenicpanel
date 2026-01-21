
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Search, Plus, User, Mail, Phone, Trash2, Calendar, Loader2, RefreshCw, Pencil, X } from 'lucide-react';
import CreateCustomerDialog from '@/components/CreateCustomerDialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/customSupabaseClient';
import { safeQuery } from '@/lib/networkUtils';
import { withErrorHandling } from '@/lib/errorHandler';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fairMap, setFairMap] = useState({});
  const [migrating, setMigrating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); 

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
      setLoading(true);
      await Promise.allSettled([fetchCustomers(), fetchFairs()]);
      setLoading(false);
  };

  const fetchFairs = async () => {
    if (!supabase) return;
    await withErrorHandling(
        () => safeQuery(() => supabase.from('fairs').select('id, fair_name')),
        null,
        "Fuar Listesi",
        (result) => {
            if (result) {
                const map = {}; 
                result.forEach(fair => { map[fair.id] = fair.fair_name; });
                setFairMap(map);
            }
        },
        { rethrow: false }
    );
  };

  const fetchCustomers = async () => {
    if (!supabase) return;
    await withErrorHandling(
        () => safeQuery(() => supabase.from('customers').select('*').order('created_at', { ascending: false })),
        null, 
        "Müşteri Listesi",
        (result) => setCustomers(result || [])
    );
  };

  const handleCreate = () => { fetchCustomers(); setIsCreateOpen(false); };
  
  const handleDelete = async (id) => {
    if (!supabase) return;
    if(!window.confirm("Silmek istediğinize emin misiniz?")) return;
    
    setActionLoading(id);
    await withErrorHandling(
        () => supabase.from('customers').delete().eq('id', id),
        () => setActionLoading(null),
        "Müşteri Silme",
        () => {
            fetchCustomers();
            toast({ title: "Silindi", description: "Müşteri başarıyla silindi.", className: "bg-green-600 text-white" });
        },
        { rethrow: false }
    );
  };

  const handleMigrateData = async () => {
    setMigrating(true);
    setTimeout(() => {
        toast({ title: "Başladı", description: "Veri taşıma simülasyonu." });
        setMigrating(false);
    }, 1500);
  };

  const getFairNames = (customer) => {
    const names = [];
    if (customer.fair_ids && customer.fair_ids.length > 0) customer.fair_ids.forEach(id => { if (fairMap[id]) names.push(fairMap[id]); });
    if (names.length === 0 && customer.fair_name) names.push(customer.fair_name);
    return names;
  };

  const filtered = customers.filter(c => {
     const searchLower = searchTerm.toLowerCase();
     if (c.company_name?.toLowerCase().includes(searchLower) || c.customer_name_surname?.toLowerCase().includes(searchLower)) return true;
     const associatedFairs = getFairNames(c);
     return associatedFairs.some(fairName => fairName.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
       <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A]/40 border border-white/5 rounded-xl backdrop-blur-md">
          <div><h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2"><User className="w-6 h-6 text-[#FF6200]" /> Müşteri Yönetimi</h1><p className="text-zinc-400 text-sm">Müşteri veritabanı ve yetkili kişiler.</p></div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleMigrateData} disabled={migrating} className="bg-[#121212] border-white/10 hover:bg-[#181818] hover:text-white text-zinc-400 text-xs h-9">
                {migrating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />} Eski Veriler
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Yeni Müşteri
            </Button>
          </div>
       </div>
       
       <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><Input placeholder="Müşteri, yetkili veya fuar ara..." className="pl-9 h-10 bg-[#0A0A0A] border-white/10 text-white rounded-lg placeholder:text-zinc-600 focus:ring-blue-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
       
       {loading ? (<div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-8 h-8 animate-spin text-[#FF6200]" /><p className="text-zinc-500 text-sm">Müşteriler yükleniyor...</p></div>) : filtered.length === 0 ? (<div className="text-center py-20 bg-[#0A0A0A]/40 rounded-xl border border-dashed border-zinc-800"><User className="w-12 h-12 mx-auto text-zinc-700 mb-4" /><p className="text-zinc-500">{searchTerm ? 'Müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}</p></div>) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filtered.map(customer => {
               const fairNames = getFairNames(customer);
               const isProcessing = actionLoading === customer.id;
               
               return (
               <div key={customer.id} className="group relative flex flex-col h-80 bg-[#0A0A0A]/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all shadow-lg hover:shadow-xl">
                   
                   {/* Delete Action */}
                   <button
                        onClick={() => handleDelete(customer.id)}
                        disabled={isProcessing}
                        className="absolute top-3 right-3 z-50 p-1.5 rounded-md bg-black/60 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all backdrop-blur-sm border border-white/5 hover:border-red-500"
                   >
                       {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                   </button>
                   
                   {/* Header */}
                   <div className="p-4 pb-2 shrink-0">
                       <div className="flex flex-wrap gap-1 mb-2">
                           <Badge variant="outline" className="text-[9px] text-[#FF6200] border-[#FF6200]/30 bg-[#FF6200]/5 px-1.5 py-0 h-4">Müşteri</Badge>
                       </div>
                       <h3 className="text-white text-lg font-bold tracking-tight truncate pr-8" title={customer.company_name}>{customer.company_name || 'Firma Adı Yok'}</h3>
                       <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mt-1"><User className="w-3 h-3 text-zinc-500" />{customer.customer_name_surname || 'İsimsiz'}</div>
                   </div>
                   
                   {/* Content */}
                   <div className="flex-1 px-4 py-2 text-sm text-zinc-400 overflow-hidden space-y-3">
                       <div className="bg-[#121212] p-3 rounded border border-white/5 space-y-2">
                           {customer.brand_rep_name && (<div className="flex items-center gap-2 text-zinc-300 text-xs font-medium"><User className="w-3 h-3 text-[#FF6200]" />{customer.brand_rep_name}</div>)}
                           {customer.brand_rep_email && (<div className="flex items-center gap-2 text-zinc-400 text-xs truncate" title={customer.brand_rep_email}><Mail className="w-3 h-3 text-zinc-600 shrink-0" />{customer.brand_rep_email}</div>)}
                           {customer.brand_rep_phone && (<div className="flex items-center gap-2 text-zinc-400 text-xs"><Phone className="w-3 h-3 text-zinc-600 shrink-0" />{customer.brand_rep_phone}</div>)}
                           {!customer.brand_rep_name && !customer.brand_rep_email && !customer.brand_rep_phone && <span className="text-xs text-zinc-600 italic">İletişim bilgisi yok</span>}
                       </div>
                       
                       {fairNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {fairNames.slice(0, 2).map((name, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[9px] text-blue-400 border-blue-400/30 bg-blue-500/5 px-1.5 py-0 h-4 truncate max-w-[120px]">{name}</Badge>
                                ))}
                                {fairNames.length > 2 && <span className="text-[9px] text-zinc-500 self-center">+{fairNames.length - 2}</span>}
                            </div>
                       )}
                   </div>
                   
                   {/* Footer */}
                   <div className="p-3 mt-auto bg-[#0A0A0A]/60 border-t border-white/5 shrink-0 backdrop-blur-sm">
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300" 
                                onClick={() => {}} 
                                disabled={isProcessing}
                            >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Düzenle
                            </Button>
                        </div>
                   </div>
               </div>
           )})}
         </div>
       )}
       <CreateCustomerDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreate} />
    </div>
  );
}
