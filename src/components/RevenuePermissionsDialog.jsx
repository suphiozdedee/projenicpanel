
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useRevenuePermissions } from '@/hooks/useRevenuePermissions';
import { useToast } from '@/components/ui/use-toast';

export default function RevenuePermissionsDialog({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [permittedUserIds, setPermittedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { grantRevenueAccess, revokeRevenueAccess, getPermittedUsers } = useRevenuePermissions();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (profilesError) throw profilesError;

      // Fetch permissions using the hook
      const permittedIds = await getPermittedUsers();
      
      setUsers(profiles || []);
      // Ensure permittedIds is an array before creating Set to prevent iteration errors
      setPermittedUserIds(new Set(Array.isArray(permittedIds) ? permittedIds : []));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Hata", description: "Kullanıcı verileri yüklenemedi." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId, currentStatus) => {
    // Optimistic update for better UI responsiveness
    const previousSet = new Set(permittedUserIds);
    const newSet = new Set(permittedUserIds);
    if (currentStatus) {
        newSet.delete(userId);
    } else {
        newSet.add(userId);
    }
    setPermittedUserIds(newSet);

    try {
      if (currentStatus) {
        await revokeRevenueAccess(userId);
        toast({ title: "Erişim Kaldırıldı", description: "Kullanıcının ciro görüntüleme yetkisi alındı.", className: "bg-red-500/10 border-red-500 text-red-500" });
      } else {
        await grantRevenueAccess(userId);
        toast({ title: "Erişim Verildi", description: "Kullanıcıya ciro görüntüleme yetkisi verildi.", className: "bg-green-500/10 border-green-500 text-green-500" });
      }
    } catch (error) {
      console.error("Permission toggle error:", error);
      // Revert optimistic update on error
      setPermittedUserIds(previousSet);
      toast({ variant: "destructive", title: "Hata", description: "Yetki değiştirilemedi." });
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
            Ciro Görüntüleme Yetkileri
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Hangi kullanıcıların toplam ciro ve finansal verileri görebileceğini yönetin. 
            Yöneticiler (Admin) her zaman tam erişime sahiptir.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="İsim veya e-posta ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-2 min-h-[300px]">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-lg border border-dashed border-zinc-800">Kullanıcı bulunamadı.</div>
          ) : (
            filteredUsers.map(user => {
               const isAdminUser = user.role === 'admin';
               const hasPermission = permittedUserIds.has(user.id) || isAdminUser;
               
               return (
                 <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-zinc-700">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-medium">
                          {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white text-sm">{user.full_name || 'İsimsiz Kullanıcı'}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAdminUser ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <span className="text-xs font-semibold text-blue-500">Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                             <span className={`text-xs font-medium ${hasPermission ? 'text-green-500' : 'text-zinc-500'}`}>
                                 {hasPermission ? 'Yetki Var' : 'Yetki Yok'}
                             </span>
                             <Switch 
                                checked={hasPermission}
                                onCheckedChange={() => handleToggle(user.id, hasPermission)}
                             />
                        </div>
                      )}
                    </div>
                 </div>
               );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
