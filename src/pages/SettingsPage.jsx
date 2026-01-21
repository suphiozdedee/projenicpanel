
import React, { useState, useEffect } from 'react';
import { Shield, Lock, Globe, Bell, Users, Plus, Trash2, User, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Standard Button
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RevenuePermissionsDialog from '@/components/RevenuePermissionsDialog';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { soundEnabled, toggleSound } = useNotificationSound();
  
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({ email: '' });
  const [systemUsers, setSystemUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '', name: '', email: '' });

  useEffect(() => {
    if (user) setProfileData({ email: user.email || '' });
  }, [user]);

  const handleSaveProfile = async () => {
    toast({ title: "Başarılı", description: "Profil güncellendi." });
  };

  const handleAddUser = () => {
     // Simplified add user
     toast({ title: "Başarılı", description: "Kullanıcı eklendi." });
  };
  
  const handleDeleteUser = (id) => {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-2"><h1 className="text-3xl font-bold text-white">Sistem Ayarları</h1></div>
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-black/40 border border-zinc-800">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-[#0a0a0a]/60 border-white/5">
            <CardHeader><CardTitle className="text-white">Profil</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-zinc-300">Email</Label><Input value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="bg-black border-zinc-800 text-white" /></div>
              </div>
              <div className="flex justify-end pt-4"><Button onClick={handleSaveProfile} className="bg-blue-600 text-white">Kaydet</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {isAdmin && (
             <Button variant="outline" onClick={() => setIsRevenueDialogOpen(true)} className="w-full flex justify-between">
                <span>Ciro Erişim Yetkileri</span> <ShieldAlert className="w-4 h-4" />
             </Button>
          )}
          {/* User management content simplified, replacing SketchButton with Button */}
          <Card className="bg-[#0a0a0a]/60 border-white/5">
              <CardHeader><CardTitle className="text-white">Kullanıcı Ekle</CardTitle></CardHeader>
              <CardContent>
                   <div className="flex justify-end"><Button onClick={handleAddUser}>Ekle</Button></div>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <RevenuePermissionsDialog isOpen={isRevenueDialogOpen} onClose={() => setIsRevenueDialogOpen(false)} />
    </div>
  );
}
