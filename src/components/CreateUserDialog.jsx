
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function CreateUserDialog({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    revenueAccess: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({ variant: "destructive", title: "Hata", description: "Lütfen tüm zorunlu alanları doldurun." });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'createUser',
          payload: formData
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Başarılı", description: "Kullanıcı oluşturuldu." });
      onSuccess();
      setFormData({ email: '', password: '', full_name: '', role: 'user', revenueAccess: false });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "İşlem Başarısız", 
        description: error.message || "Kullanıcı oluşturulamadı." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input 
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              className="bg-[#0A0A0A] border-zinc-800"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="bg-[#0A0A0A] border-zinc-800"
              placeholder="ornek@projenic.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Şifre</Label>
            <Input 
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="bg-[#0A0A0A] border-zinc-800"
              placeholder="********"
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={formData.role} onValueChange={val => setFormData({...formData, role: val})}>
              <SelectTrigger className="bg-[#0A0A0A] border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-zinc-800 text-white">
                <SelectItem value="user">Kullanıcı (User)</SelectItem>
                <SelectItem value="designer">Tasarımcı (Designer)</SelectItem>
                <SelectItem value="admin">Yönetici (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-[#0A0A0A]">
            <div className="space-y-0.5">
              <Label>Ciro Erişimi</Label>
              <div className="text-xs text-zinc-500">Finansal verileri görebilir</div>
            </div>
            <Switch 
              checked={formData.revenueAccess}
              onCheckedChange={c => setFormData({...formData, revenueAccess: c})}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading} className="bg-[#FF6200] hover:bg-[#FF6200]/90">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
