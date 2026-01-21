
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import MasterButton from '@/components/MasterButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Calendar, Mail, Layout,  FileText, Image as ImageIcon, X, MonitorPlay } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';

const UPLOAD_CATEGORIES = [
  { id: 'incoming_email', label: 'Gelen Mail', icon: Mail, multiple: false },
  { id: 'floor_plan', label: 'Alan Planı', icon: Layout, multiple: false },
  { id: 'logo', label: 'Logo', icon: ImageIcon, multiple: false },
  { id: 'product_images', label: 'Ürün Görselleri', icon: ImageIcon, multiple: true },
  { id: 'previous_stand', label: 'Eski Stand', icon: MonitorPlay, multiple: true },
  { id: 'design_examples', label: 'Örnekler', icon: FileText, multiple: true },
];

export default function CreateProjectDialog({ isOpen, onClose, onSuccess, initialData = null, onEditSuccess }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fairs, setFairs] = useState([]);
  const [representatives, setRepresentatives] = useState([]);
  const [uploadingState, setUploadingState] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({ incoming_email: [], floor_plan: [], logo: [], product_images: [], previous_stand: [], design_examples: [] });
  const [formData, setFormData] = useState({ brand: '', work_type: 'Fuar', requested_project_type: 'Ahşap', fair_id: '', fair_event: '', city: '', venue: '', start_date: '', end_date: '', assigned_to: '', status: 'Bekliyor', price: '', description: '', square_meters: '' });

  useEffect(() => {
    if(isOpen) {
        const fetchData = async () => {
            try {
                const { data: fairsData } = await supabase.from('fairs').select('*').order('start_date', { ascending: true });
                setFairs(fairsData || []);
                const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true });
                setRepresentatives(profilesData || []);
            } catch (error) { console.error('Error fetching data:', error); }
        };
        fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand: initialData.brand || '', 
        work_type: initialData.stand_type || 'Fuar', 
        requested_project_type: initialData.description?.includes('İş Türü:') ? initialData.stand_type : (initialData.description || 'Ahşap'),
        fair_id: '', 
        fair_event: initialData.fair_event || '', 
        city: initialData.city || '', 
        venue: initialData.fair_area || '', 
        start_date: initialData.start_date || '', 
        end_date: initialData.end_date || '',
        assigned_to: initialData.assigned_to || '', 
        status: initialData.status || 'Bekliyor', 
        price: initialData.price || '', 
        description: initialData.description || '', 
        square_meters: initialData.square_meters || ''
      });
      if (initialData.file_urls) setUploadedFiles({ incoming_email: [], floor_plan: [], logo: [], product_images: [], previous_stand: [], design_examples: [], ...initialData.file_urls });
    } else {
      setFormData({ brand: '', work_type: 'Fuar', requested_project_type: 'Ahşap', fair_id: '', fair_event: '', city: '', venue: '', start_date: '', end_date: '', assigned_to: '', status: 'Bekliyor', price: '', description: '', square_meters: '' });
      setUploadedFiles({ incoming_email: [], floor_plan: [], logo: [], product_images: [], previous_stand: [], design_examples: [] });
    }
  }, [initialData, isOpen]);

  const handleFairSelect = (fairId) => {
    const selectedFair = fairs.find(f => f.id === fairId);
    if (selectedFair) setFormData(prev => ({ ...prev, fair_id: fairId, fair_event: selectedFair.fair_name, city: selectedFair.city, venue: selectedFair.venue, start_date: selectedFair.start_date, end_date: selectedFair.end_date }));
  };

  const handleFileUpload = async (event, categoryId, multiple) => {
    if (!formData.brand.trim()) { toast({ variant: "destructive", title: "Marka Adı Gerekli", description: "Dosya yüklemeden önce marka adı giriniz." }); event.target.value = ''; return; }
    const files = Array.from(event.target.files); if (files.length === 0) return;
    setUploadingState(prev => ({ ...prev, [categoryId]: true }));
    const brandFolder = formData.brand.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_') || 'Untitled';
    try {
      const newUploads = [];
      for (const file of files) {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${brandFolder}/${categoryId}/${Date.now()}_${cleanFileName}`;
        const { error: uploadError } = await supabase.storage.from('project_files').upload(filePath, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('project_files').getPublicUrl(filePath);
        newUploads.push({ name: file.name, url: publicUrl, path: filePath });
      }
      setUploadedFiles(prev => ({ ...prev, [categoryId]: multiple ? [...(prev[categoryId] || []), ...newUploads] : newUploads }));
      toast({ title: "Başarılı", description: "Dosyalar yüklendi." });
    } catch (error) { toast({ variant: "destructive", title: "Hata", description: "Yükleme hatası." }); } 
    finally { setUploadingState(prev => ({ ...prev, [categoryId]: false })); event.target.value = ''; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.brand.trim()) throw new Error('Marka adı gereklidir.');
      
      const projectData = { 
          brand: formData.brand,
          fair_event: formData.fair_event,
          city: formData.city,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          stand_type: formData.work_type,
          description: formData.description,
          assigned_to: formData.assigned_to || null,
          status: formData.status,
          square_meters: formData.square_meters ? parseFloat(formData.square_meters) : null, 
          created_by: currentUser?.id, 
          created_by_username: currentUser?.full_name || 'Bilinmiyor', 
          updated_at: new Date().toISOString(), 
          file_urls: uploadedFiles,
          fair_area: formData.venue // Keeping this if DB supports it, otherwise might need removal if strictly no fair_name
      };
      
      if (initialData?.id) {
        const { data, error } = await supabase.from('projects').update(projectData).eq('id', initialData.id).select().single();
        if (error) throw error; if (onEditSuccess) onEditSuccess(data);
      } else {
        const { data, error } = await supabase.from('projects').insert({ ...projectData, created_at: new Date().toISOString() }).select().single();
        if (error) throw error; if (onSuccess) onSuccess(data);
      }
      toast({ title: "Başarılı", description: initialData ? "Proje güncellendi." : "Proje oluşturuldu." });
      onClose();
    } catch (error) { toast({ variant: "destructive", title: "Hata", description: error.message }); } 
    finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-5 bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg text-white"><Briefcase className="w-4 h-4 text-blue-500" /> {initialData ? 'Projeyi Düzenle' : 'Yeni Proje'}</DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">Fuar takviminden seçim yapın ve proje detaylarını girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs text-zinc-300">Marka Adı</Label><Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="h-8 text-sm bg-zinc-950 border-zinc-800 text-white" required placeholder="Firma adı..." /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs text-zinc-300">İş Türü</Label><Select value={formData.work_type} onValueChange={v => setFormData({...formData, work_type: v})}><SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="Fuar">Fuar</SelectItem><SelectItem value="İç Mimari">İç Mimari</SelectItem><SelectItem value="Showroom">Showroom</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs text-zinc-300">Personel</Label><Select value={formData.assigned_to} onValueChange={v => setFormData({...formData, assigned_to: v})}><SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white">{representatives.map(u => (<SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3 space-y-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><Calendar className="w-3 h-3" /> Fuar Bilgileri</div>
              <div className="space-y-1"><Label className="text-[10px] uppercase text-zinc-500">Fuar Seç</Label><Select value={formData.fair_id} onValueChange={handleFairSelect} disabled={formData.work_type !== 'Fuar'}><SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"><SelectValue placeholder={formData.fair_event || "Seçiniz"} /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white">{fairs.map(f => (<SelectItem key={f.id} value={f.id}>{f.fair_name} ({format(new Date(f.start_date), 'MMM yyyy')})</SelectItem>))}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-2"><Input value={formData.venue} disabled className="h-7 text-xs bg-zinc-950/50 border-zinc-800 text-zinc-500" placeholder="Fuar Yeri" /><Input value={formData.city} disabled className="h-7 text-xs bg-zinc-950/50 border-zinc-800 text-zinc-500" placeholder="Şehir" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs text-zinc-300">Proje Tipi</Label><Select value={formData.requested_project_type} onValueChange={v => setFormData({...formData, requested_project_type: v})}><SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="Ahşap">Ahşap</SelectItem><SelectItem value="Maksima">Maksima</SelectItem><SelectItem value="Modüler">Modüler</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs text-zinc-300">m²</Label><Input type="number" value={formData.square_meters} onChange={e => setFormData({...formData, square_meters: e.target.value})} className="h-8 text-sm bg-zinc-950 border-zinc-800 text-white" placeholder="0" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs text-zinc-300">Açıklama</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[80px] text-xs resize-none bg-zinc-950 border-zinc-800 text-white" placeholder="Notlar..." /></div>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1"><h3 className="text-sm font-semibold text-zinc-200">Dosyalar</h3>{formData.brand && <div className="text-[10px] text-zinc-500">/{formData.brand.slice(0,10)}...</div>}</div>
             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {UPLOAD_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-zinc-900/50 border border-zinc-800 rounded p-2">
                    <div className="flex justify-between items-center mb-1.5"><Label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer"><cat.icon className="w-3 h-3 text-blue-500" /> {cat.label}</Label><div className="relative"><input type="file" id={`file-${cat.id}`} className="hidden" multiple={cat.multiple} onChange={e => handleFileUpload(e, cat.id, cat.multiple)} disabled={uploadingState[cat.id] || !formData.brand} /><label htmlFor={`file-${cat.id}`} className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-700">{uploadingState[cat.id] ? '...' : '+'}</label></div></div>
                    <div className="space-y-1">{uploadedFiles[cat.id]?.length > 0 ? uploadedFiles[cat.id].map((f, i) => (<div key={i} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-1 rounded text-[10px] text-zinc-400"><span className="truncate max-w-[150px]">{f.name}</span><X className="w-3 h-3 text-zinc-500 cursor-pointer hover:text-red-500" onClick={() => setUploadedFiles(p => ({...p, [cat.id]: p[cat.id].filter(x => x.url !== f.url)}))} /></div>)) : <div className="text-[9px] text-zinc-600 italic">Boş</div>}</div>
                  </div>
                ))}
             </div>
          </div>
          <DialogFooter className="col-span-1 md:col-span-2 pt-2 border-t border-zinc-800 gap-2">
              <MasterButton variant="ghost" type="button" onClick={onClose} size="sm">İptal</MasterButton>
              <MasterButton variant="primary" type="submit" size="sm" disabled={loading}>{loading ? '...' : 'Kaydet'}</MasterButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
