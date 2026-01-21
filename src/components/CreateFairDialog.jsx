
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import MasterButton from '@/components/MasterButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarRange, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LOCATION_DATA = { "Türkiye": { cities: ["İstanbul", "Ankara", "İzmir", "Antalya", "Konya", "Bursa", "Adana", "Gaziantep", "Kocaeli", "Mersin"], venues: ["TÜYAP Fuar ve Kongre Merkezi", "IFM (İstanbul Fuar Merkezi)", "İstanbul Kongre Merkezi", "Lütfi Kırdar Kongre Merkezi", "Antalya Anfaş", "Fuar İzmir", "ATO Congresium (Ankara)", "KTO - TÜYAP Konya", "Bursa Uluslararası Fuar Merkezi", "Congresium Ankara", "Merinos AKKM (Bursa)", "Diğer"] }, "Almanya": { cities: ["Berlin", "Frankfurt", "Düsseldorf", "Münih", "Köln", "Hannover", "Hamburg", "Nürnberg", "Stuttgart", "Essen"], venues: ["Messe Berlin", "Messe Frankfurt", "Messe Düsseldorf", "Messe München", "Koelnmesse", "Deutsche Messe Hannover", "Hamburg Messe", "NürnbergMesse", "Messe Stuttgart", "Messe Essen", "Diğer"] }, "Fransa": { cities: ["Paris", "Lyon", "Cannes", "Marsilya", "Bordeaux"], venues: ["Paris Nord Villepinte", "Paris Expo Porte de Versailles", "Eurexpo Lyon", "Palais des Festivals et des Congrès", "Marseille Chanot", "Diğer"] }, "İtalya": { cities: ["Milano", "Bologna", "Verona", "Roma", "Torino", "Rimini"], venues: ["Fiera Milano", "BolognaFiere", "Veronafiere", "Fiera di Roma", "Lingotto Fiere", "Rimini Fiera", "Diğer"] }, "İngiltere": { cities: ["Londra", "Birmingham", "Manchester", "Liverpool"], venues: ["ExCeL London", "Olympia London", "NEC Birmingham", "Manchester Central", "Diğer"] }, "Hollanda": { cities: ["Amsterdam", "Rotterdam", "Utrecht"], venues: ["RAI Amsterdam", "Ahoy Rotterdam", "Jaarbeurs Utrecht", "Diğer"] }, "İspanya": { cities: ["Barselona", "Madrid", "Valensiya", "Bilbao"], venues: ["Fira de Barcelona", "IFEMA Madrid", "Feria Valencia", "BEC (Bilbao Exhibition Centre)", "Diğer"] }, "Rusya": { cities: ["Moskova", "St. Petersburg"], venues: ["Crocus Expo", "Expocentre", "VDNH", "ExpoForum", "Diğer"] }, "BAE (Dubai)": { cities: ["Dubai", "Abu Dhabi", "Sharjah"], venues: ["Dubai World Trade Centre", "ADNEC (Abu Dhabi)", "Expo Centre Sharjah", "Diğer"] }, "Suudi Arabistan": { cities: ["Riyad", "Cidde", "Dammam"], venues: ["Riyadh International Convention & Exhibition Center", "Jeddah Centre for Forums & Events", "Dhahran Expo", "Diğer"] }, "ABD": { cities: ["Las Vegas", "New York", "Chicago", "Orlando", "Atlanta"], venues: ["Las Vegas Convention Center", "Javits Center", "McCormick Place", "Orange County Convention Center", "Georgia World Congress Center", "Diğer"] }, "Çin": { cities: ["Şanghay", "Pekin", "Guangzhou", "Shenzhen"], venues: ["NECC (Shanghai)", "Canton Fair Complex", "Shenzhen World Exhibition & Convention Center", "CIEC (Beijing)", "Diğer"] }, "Diğer": { cities: [], venues: ["Diğer"] } };
const COUNTRIES = Object.keys(LOCATION_DATA).filter(k => k !== "Diğer").sort().concat("Diğer");

export default function CreateFairDialog({ isOpen, onClose, onSuccess, initialData = null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fair_name: '', country: 'Türkiye', city: '', venue: '', start_date: '', end_date: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({ fair_name: initialData.fair_name || '', country: initialData.country || 'Türkiye', city: initialData.city || '', venue: initialData.venue || '', start_date: initialData.start_date || '', end_date: initialData.end_date || '', description: initialData.description || '' });
    } else {
      setFormData({ fair_name: '', country: 'Türkiye', city: '', venue: '', start_date: '', end_date: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleCountryChange = (value) => { setFormData(prev => ({ ...prev, country: value, city: '', venue: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.fair_name.trim()) throw new Error('Fuar adı gereklidir.');
      if (!formData.start_date) throw new Error('Başlangıç tarihi gereklidir.');
      if (!formData.country) throw new Error('Ülke seçimi zorunludur.');
      const finalEndDate = formData.end_date || formData.start_date;
      const payload = { fair_name: formData.fair_name, country: formData.country, city: formData.city || 'Belirtilmedi', venue: formData.venue || 'Belirtilmedi', start_date: formData.start_date, end_date: finalEndDate, description: formData.description, user_created: true };
      let error;
      if (initialData?.id) { const { error: updateError } = await supabase.from('fairs').update(payload).eq('id', initialData.id); error = updateError; } 
      else { const { error: insertError } = await supabase.from('fairs').insert([payload]); error = insertError; }
      if (error) throw error;
      toast({ title: "Başarılı", description: initialData ? "Fuar güncellendi." : "Fuar takvime eklendi." });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) { toast({ variant: "destructive", title: "Hata", description: error.message || "İşlem sırasında bir hata oluştu." }); } 
    finally { setLoading(false); }
  };

  const currentCities = formData.country && LOCATION_DATA[formData.country] ? LOCATION_DATA[formData.country].cities : [];
  const currentVenues = formData.country && LOCATION_DATA[formData.country] ? LOCATION_DATA[formData.country].venues : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px] overflow-visible">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarRange className="w-5 h-5 text-blue-500" /> {initialData ? 'Fuarı Düzenle' : 'Yeni Fuar Ekle'}</DialogTitle><DialogDescription className="text-zinc-400">Fuar takvimine yeni bir etkinlik ekleyin.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Fuar Adı</Label><Input value={formData.fair_name} onChange={e => setFormData({...formData, fair_name: e.target.value})} placeholder="Örn: WIN Eurasia 2024" className="bg-zinc-950/50 border-zinc-700 focus:border-blue-500" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="flex items-center gap-2"><Globe className="w-3 h-3 text-zinc-400" /> Ülke</Label><Select value={formData.country} onValueChange={handleCountryChange}><SelectTrigger className="bg-zinc-950/50 border-zinc-700"><SelectValue placeholder="Ülke Seçiniz" /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[250px]">{COUNTRIES.map(country => (<SelectItem key={country} value={country}>{country}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="flex items-center gap-2"><MapPin className="w-3 h-3 text-zinc-400" /> Şehir</Label><Select value={formData.city} onValueChange={(val) => setFormData({...formData, city: val})} disabled={!formData.country}><SelectTrigger className="bg-zinc-950/50 border-zinc-700"><SelectValue placeholder={currentCities.length === 0 ? "Manuel Yazınız" : "Şehir Seçiniz"} /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[250px]">{currentCities.length > 0 ? (currentCities.map(city => (<SelectItem key={city} value={city}>{city}</SelectItem>))) : (<SelectItem value="Other" disabled>Listede şehir yok</SelectItem>)}{formData.city && !currentCities.includes(formData.city) && (<SelectItem value={formData.city}>{formData.city}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Fuar Yeri / Venue</Label><Select value={formData.venue} onValueChange={(val) => setFormData({...formData, venue: val})} disabled={!formData.country}><SelectTrigger className="bg-zinc-950/50 border-zinc-700"><SelectValue placeholder={currentVenues.length === 0 ? "Manuel Yazınız" : "Fuar Yeri Seçiniz"} /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[250px]">{currentVenues.length > 0 ? (currentVenues.map(venue => (<SelectItem key={venue} value={venue}>{venue}</SelectItem>))) : (<SelectItem value="Other" disabled>Listede yer yok</SelectItem>)}{formData.venue && !currentVenues.includes(formData.venue) && (<SelectItem value={formData.venue}>{formData.venue}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Başlangıç Tarihi</Label><Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="bg-zinc-950/50 border-zinc-700 block w-full focus:border-blue-500" required /></div>
            <div className="space-y-2"><Label>Bitiş Tarihi</Label><Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="bg-zinc-950/50 border-zinc-700 block w-full focus:border-blue-500" /></div>
          </div>
          <div className="space-y-2"><Label>Açıklama (Opsiyonel)</Label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Notlar..." className="bg-zinc-950/50 border-zinc-700 focus:border-blue-500" /></div>
          <DialogFooter className="mt-4 pt-4 border-t border-zinc-800 gap-2">
              <MasterButton type="button" variant="ghost" onClick={() => onClose()}>İptal</MasterButton>
              <MasterButton type="submit" variant="primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Kaydet</MasterButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
