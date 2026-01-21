
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import MasterButton from '@/components/MasterButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CalendarPlus as CalendarIcon, PenLine } from 'lucide-react';

export default function EditBriefDialog({ isOpen, onClose, project, onSuccess }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [designers, setDesigners] = useState([]);
    
    const [formData, setFormData] = useState({ brand: '', fair_event: '', start_date: '', end_date: '', city: '', stand_type: 'Ahşap', square_meters: '', description: '', assigned_to: '', budget: '', currency: 'TRY' });

    useEffect(() => {
        if (isOpen && project) {
            setFormData({
                brand: project.brand || '', fair_event: project.fair_event || '', start_date: project.start_date || '', end_date: project.end_date || '', city: project.city || '', stand_type: project.stand_type || 'Ahşap', square_meters: project.square_meters || '', description: project.description || '', assigned_to: project.assigned_to || 'unassigned', budget: project.budget || '', currency: project.currency || 'TRY'
            });
            fetchDesigners();
        }
    }, [isOpen, project]);

    const fetchDesigners = async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'designer');
            if (error) throw error;
            setDesigners(data || []);
        } catch (error) { console.error('Error fetching designers:', error); }
    };

    const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.brand) throw new Error("Marka adı zorunludur.");
            const updates = { 
                brand: formData.brand, 
                fair_event: formData.fair_event, 
                start_date: formData.start_date || null, 
                end_date: formData.end_date || null, 
                city: formData.city, 
                stand_type: formData.stand_type, 
                square_meters: formData.square_meters ? parseFloat(formData.square_meters) : null, 
                description: formData.description, 
                assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to, 
                budget: formData.budget ? parseFloat(formData.budget) : null, 
                currency: formData.currency, 
                updated_at: new Date().toISOString() 
            };
            const { error } = await supabase.from('projects').update(updates).eq('id', project.id);
            if (error) throw error;
            toast({ title: "Proje Güncellendi", description: "Değişiklikler başarıyla kaydedildi.", className: "bg-green-500/10 border-green-500 text-green-500" });
            onSuccess?.();
            onClose();
        } catch (error) { toast({ variant: "destructive", title: "Hata", description: error.message || "Proje güncellenirken bir sorun oluştu." }); } 
        finally { setLoading(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-2"><PenLine className="w-5 h-5 text-blue-500" /> Projeyi Düzenle</DialogTitle><DialogDescription className="text-zinc-400">Proje detaylarını ve atamalarını güncelleyin.</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Marka / Firma Adı *</Label><Input value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" placeholder="Örn: Tesla" /></div>
                        <div className="space-y-2"><Label>Fuar / Etkinlik Adı</Label><Input value={formData.fair_event} onChange={(e) => handleChange('fair_event', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" placeholder="Örn: Mobile World Congress" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Başlangıç Tarihi</Label><div className="relative"><CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><Input type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)} className="pl-9 bg-zinc-950 border-zinc-800 focus:border-blue-500" /></div></div>
                        <div className="space-y-2"><Label>Bitiş Tarihi</Label><div className="relative"><CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><Input type="date" value={formData.end_date} onChange={(e) => handleChange('end_date', e.target.value)} className="pl-9 bg-zinc-950 border-zinc-800 focus:border-blue-500" /></div></div>
                        <div className="space-y-2"><Label>Şehir / Konum</Label><Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" placeholder="Örn: İstanbul" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Stand Türü</Label><Select value={formData.stand_type} onValueChange={(val) => handleChange('stand_type', val)}><SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-blue-500"><SelectValue placeholder="Seçiniz" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="Ahşap">Ahşap</SelectItem><SelectItem value="Maxima">Maxima</SelectItem><SelectItem value="Modüler">Modüler</SelectItem><SelectItem value="Hibrit">Hibrit</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Metrekare (m²)</Label><Input type="number" value={formData.square_meters} onChange={(e) => handleChange('square_meters', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" placeholder="0" /></div>
                         <div className="space-y-2"><Label>Atanan Tasarımcı</Label><Select value={formData.assigned_to || 'unassigned'} onValueChange={(val) => handleChange('assigned_to', val)}><SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-blue-500"><SelectValue placeholder="Tasarımcı Seçiniz" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="unassigned">Atanmamış</SelectItem>{designers.map(d => (<SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>))}</SelectContent></Select></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Bütçe</Label><Input type="number" value={formData.budget} onChange={(e) => handleChange('budget', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500" placeholder="0.00" /></div>
                        <div className="space-y-2"><Label>Para Birimi</Label><Select value={formData.currency} onValueChange={(val) => handleChange('currency', val)}><SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-blue-500"><SelectValue placeholder="Seçiniz" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white"><SelectItem value="TRY">TRY (₺)</SelectItem><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label>Proje Açıklaması / Notlar</Label><Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="bg-zinc-950 border-zinc-800 focus:border-blue-500 min-h-[100px]" placeholder="Proje detayları..." /></div>
                    <DialogFooter className="gap-2"><MasterButton type="button" variant="ghost" onClick={onClose} disabled={loading}>İptal</MasterButton><MasterButton type="submit" variant="primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Değişiklikleri Kaydet</MasterButton></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
