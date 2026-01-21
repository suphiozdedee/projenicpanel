import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function SubcontractorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subcontractors, setSubcontractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    service_type: 'Montaj',
    city: '',
    notes: ''
  });

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const fetchSubcontractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubcontractors(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ variant: 'destructive', title: 'Hata', description: 'Taşeron listesi yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcontractor = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!user?.id) throw new Error("Oturum hatası.");

      const { error } = await supabase.from('subcontractors').insert([{
        ...formData,
        created_by: user.id
      }]);

      if (error) throw error;

      toast({ title: "Başarılı", description: "Taşeron eklendi." });
      setIsAddOpen(false);
      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        service_type: 'Montaj',
        city: '',
        notes: ''
      });
      fetchSubcontractors();

    } catch (error) {
       toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
       setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Fixed: Explicitly use window.confirm to avoid linter error
    if(!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    
    try {
      const { error } = await supabase.from('subcontractors').delete().eq('id', id);
      if(error) throw error;
      toast({ title: "Silindi", description: "Kayıt başarıyla silindi." });
      fetchSubcontractors();
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Silme işlemi başarısız." });
    }
  };

  const filtered = subcontractors.filter(s => 
    s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-display text-glow">Taşeron Yönetimi</h1>
          <p className="text-zinc-400 text-sm mt-1">İş ortaklarınızı ve tedarikçilerinizi yönetin.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-[#FF6200] hover:bg-[#FF6200]/90 text-white shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4 mr-2" /> Yeni Ekle
        </Button>
      </div>

      <div className="flex bg-zinc-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-lg">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Firma adı veya hizmet türü ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-zinc-800 text-white h-10 focus:ring-[#FF6200] rounded-lg"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
           <Loader2 className="w-8 h-8 animate-spin text-[#FF6200]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
           <p>Kayıtlı taşeron bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map(sub => (
              <Card key={sub.id} className="glass-card group relative">
                 <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                       <Badge variant="outline" className="mb-2 text-zinc-400 border-zinc-700 bg-zinc-900/50">
                          {sub.service_type}
                       </Badge>
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-500" onClick={() => handleDelete(sub.id)}>
                          <Trash2 className="w-3 h-3" />
                       </Button>
                    </div>
                    <CardTitle className="text-xl text-white">{sub.company_name}</CardTitle>
                    <p className="text-sm text-zinc-400 flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> {sub.city || 'Şehir Belirtilmedi'}
                    </p>
                 </CardHeader>
                 <CardContent className="space-y-3 text-sm">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-zinc-300">
                          <Users className="w-4 h-4 text-[#FF6200]" />
                          <span>{sub.contact_person || '-'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-zinc-300">
                          <Phone className="w-4 h-4 text-[#FF6200]" />
                          <span>{sub.phone || '-'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-zinc-300">
                          <Mail className="w-4 h-4 text-[#FF6200]" />
                          <span>{sub.email || '-'}</span>
                       </div>
                    </div>
                    {sub.notes && (
                       <p className="text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded border border-zinc-800 mt-2">
                          {sub.notes}
                       </p>
                    )}
                 </CardContent>
                 <CardFooter className="pt-2 border-t border-white/5">
                    <div className="flex text-[#FF6200]">
                       {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= (sub.rating || 0) ? 'fill-current' : 'text-zinc-700'}`} />
                       ))}
                    </div>
                 </CardFooter>
              </Card>
           ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="glass-panel border-zinc-800 text-white">
            <DialogHeader>
               <DialogTitle>Yeni Taşeron Ekle</DialogTitle>
               <DialogDescription>Yeni bir iş ortağı veya tedarikçi ekleyin.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubcontractor} className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>Firma Adı</Label>
                  <Input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Hizmet Türü</Label>
                      <select 
                         className="w-full h-10 px-3 rounded-md bg-zinc-900/50 border border-zinc-700 text-sm"
                         value={formData.service_type}
                         onChange={e => setFormData({...formData, service_type: e.target.value})}
                      >
                         <option value="Montaj">Montaj</option>
                         <option value="Elektrik">Elektrik</option>
                         <option value="Lojistik">Lojistik</option>
                         <option value="Baskı">Baskı</option>
                         <option value="Mobilya">Mobilya</option>
                         <option value="Catering">Catering</option>
                         <option value="Temizlik">Temizlik</option>
                         <option value="Diğer">Diğer</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <Label>Şehir</Label>
                      <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
                   </div>
               </div>
               <div className="space-y-2">
                  <Label>Yetkili Kişi</Label>
                  <Input value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
                   </div>
                   <div className="space-y-2">
                      <Label>E-posta</Label>
                      <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
                   </div>
               </div>
               <div className="space-y-2">
                  <Label>Notlar</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-zinc-900/50 border-zinc-700" />
               </div>

               <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>İptal</Button>
                  <Button type="submit" disabled={isSaving} className="bg-[#FF6200]">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}