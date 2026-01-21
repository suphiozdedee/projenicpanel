
import React, { useState, useEffect } from 'react';
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

export default function EditUserDialog({ isOpen, onClose, onSuccess, user }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'user',
    revenueAccess: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        role: user.role || 'user',
        revenueAccess: user.revenueAccess || false
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            full_name: formData.full_name,
            role: formData.role 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update Revenue Permissions
      if (formData.revenueAccess !== user.revenueAccess) {
        if (formData.revenueAccess) {
          const { error: revError } = await supabase
            .from('revenue_permissions')
            .insert({ user_id: user.id });
          if (revError && revError.code !== '23505') throw revError; // Ignore unique constraint violation
        } else {
          const { error: revError } = await supabase
            .from('revenue_permissions')
            .delete()
            .eq('user_id', user.id);
          if (revError) throw revError;
        }
      }

      toast({ title: "Başarılı", description: "Kullanıcı güncellendi." });
      onSuccess();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Hata", 
        description: error.message || "Güncelleme başarısız." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>E-posta (Değiştirilemez)</Label>
            <Input 
              value={user?.email || ''}
              disabled
              className="bg-[#0A0A0A] border-zinc-800 opacity-50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input 
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              className="bg-[#0A0A0A] border-zinc-800"
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
              Güncelle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
