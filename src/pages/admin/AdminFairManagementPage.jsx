import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Calendar as CalendarIcon, 
  Search,
  Globe,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AdminFairManagementPage() {
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFairId, setSelectedFairId] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fair_name: '',
    country: 'Türkiye',
    city: '',
    venue: '',
    start_date: '',
    end_date: '',
    category: 'Genel'
  });

  useEffect(() => {
    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fairs')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Fuarlar yüklenemedi' });
    } else {
      setFairs(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('fairs')
          .update(formData)
          .eq('id', selectedFairId);
        if (error) throw error;
        toast({ title: 'Başarılı', description: 'Fuar güncellendi' });
      } else {
        const { error } = await supabase
          .from('fairs')
          .insert([{ ...formData, user_created: true }]);
        if (error) throw error;
        toast({ title: 'Başarılı', description: 'Yeni fuar eklendi' });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchFairs();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu fuarı silmek istediğinizden emin misiniz?')) return;
    try {
      const { error } = await supabase.from('fairs').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Silindi', description: 'Fuar başarıyla silindi' });
      fetchFairs();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    }
  };

  const openEditDialog = (fair) => {
    setFormData({
      fair_name: fair.fair_name,
      country: fair.country,
      city: fair.city,
      venue: fair.venue || '',
      start_date: fair.start_date,
      end_date: fair.end_date,
      category: fair.category || 'Genel'
    });
    setSelectedFairId(fair.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fair_name: '',
      country: 'Türkiye',
      city: '',
      venue: '',
      start_date: '',
      end_date: '',
      category: 'Genel'
    });
    setIsEditMode(false);
    setSelectedFairId(null);
  };

  const filteredFairs = fairs.filter(fair => 
    fair.fair_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fair.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Fuar Yönetimi</h1>
          <p className="text-zinc-400">Sisteme yeni fuarlar ekleyin veya mevcutları düzenleyin.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#FF6200] hover:bg-[#FF6200]/90">
          <Plus className="w-4 h-4 mr-2" /> Yeni Fuar Ekle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Fuar ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFairs.map((fair) => (
          <Card key={fair.id} className="bg-[#0a0a0a] border-zinc-800 group hover:border-zinc-700 transition-colors">
            <CardHeader className="pb-3 relative">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => openEditDialog(fair)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-800" onClick={() => handleDelete(fair.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mb-2">
                 <Badge variant="outline" className="text-xs">{fair.country}</Badge>
                 {fair.user_created && <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">Admin Ekledi</Badge>}
              </div>
              <CardTitle className="text-lg font-bold text-white leading-tight pr-8">{fair.fair_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <CalendarIcon className="w-4 h-4 text-[#FF6200]" />
                <span>{fair.start_date} - {fair.end_date}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-400">
                <MapPin className="w-4 h-4 text-[#FF6200] mt-0.5" />
                <div>
                   <span className="block text-white">{fair.city}</span>
                   <span className="text-xs text-zinc-500">{fair.venue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-zinc-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Fuarı Düzenle' : 'Yeni Fuar Ekle'}</DialogTitle>
            <DialogDescription className="text-zinc-400">Fuar detaylarını giriniz.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
               <Label>Fuar Adı</Label>
               <Input 
                  required 
                  value={formData.fair_name}
                  onChange={e => setFormData({...formData, fair_name: e.target.value})}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="Örn: Yapı Fuarı 2024"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Ülke</Label>
                 <select 
                   className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white"
                   value={formData.country}
                   onChange={e => setFormData({...formData, country: e.target.value})}
                 >
                   <option value="Türkiye">Türkiye</option>
                   <option value="Almanya">Almanya</option>
                   <option value="ABD">ABD</option>
                   <option value="İtalya">İtalya</option>
                   <option value="Fransa">Fransa</option>
                   <option value="Diğer">Diğer</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <Label>Şehir</Label>
                 <Input 
                    required 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="İstanbul"
                 />
              </div>
            </div>

            <div className="space-y-2">
               <Label>Fuar Alanı / Konum (Opsiyonel)</Label>
               <Input 
                  value={formData.venue}
                  onChange={e => setFormData({...formData, venue: e.target.value})}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="TÜYAP, IFM, Messe Frankfurt..."
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Başlangıç Tarihi</Label>
                 <Input 
                    type="date"
                    required 
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="bg-zinc-900 border-zinc-800 block"
                 />
              </div>
              <div className="space-y-2">
                 <Label>Bitiş Tarihi</Label>
                 <Input 
                    type="date"
                    required 
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="bg-zinc-900 border-zinc-800 block"
                 />
              </div>
            </div>

            <div className="space-y-2">
               <Label>Kategori</Label>
               <Input 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="Örn: İnşaat, Teknoloji, Otomotiv"
               />
            </div>

            <DialogFooter className="pt-4">
               <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>İptal</Button>
               <Button type="submit" className="bg-[#FF6200] hover:bg-[#FF6200]/90">
                 <Save className="w-4 h-4 mr-2" /> Kaydet
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}