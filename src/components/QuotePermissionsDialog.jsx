
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import MasterButton from '@/components/MasterButton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, UserPlus, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useQuotePermissions } from '@/hooks/useQuotePermissions';

export default function QuotePermissionsDialog({ isOpen, onClose, project }) {
  const { toast } = useToast();
  const { getQuoteAccessList, grantAccess, revokeAccess } = useQuotePermissions();
  
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      loadPermissions();
      setActiveTab('list');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, project]);

  const loadPermissions = async () => {
    if (!project) return;
    try {
      setLoading(true);
      const data = await getQuoteAccessList(project.id);
      setPermissions(data || []);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Hata", description: "Erişim listesi yüklenemedi." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const existingUserIds = permissions.map(p => p.user_id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      
      const filtered = data.filter(u => 
        !existingUserIds.includes(u.id) && 
        u.id !== project.created_by &&
        u.id !== project.assigned_to
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGrant = async (userId) => {
    try {
      await grantAccess(project.id, userId);
      toast({
        title: "Erişim Verildi",
        description: "Kullanıcı artık bu teklifi görüntüleyebilir.",
        className: "bg-green-500/10 border-green-500 text-green-500"
      });
      loadPermissions();
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Erişim verilemedi." });
    }
  };

  const handleRevoke = async (permissionId) => {
    try {
      await revokeAccess(permissionId);
      toast({
        title: "Erişim Kaldırıldı",
        description: "Kullanıcının erişim yetkisi alındı.",
      });
      loadPermissions();
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Erişim kaldırılamadı." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-full">
               <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
                <DialogTitle>Erişim Yönetimi</DialogTitle>
                <DialogDescription className="text-zinc-400">
                    {project?.brand} projesi için görüntüleme yetkilerini yönetin.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2">
            <MasterButton 
                variant={activeTab === 'list' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('list')}
                className={activeTab === 'list' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}
            >
                Mevcut Erişimler ({permissions.length})
            </MasterButton>
            <MasterButton 
                variant={activeTab === 'add' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('add')}
                className={activeTab === 'add' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}
            >
                <UserPlus className="w-4 h-4 mr-2" />
                Kullanıcı Ekle
            </MasterButton>
        </div>

        {activeTab === 'list' && (
            <ScrollArea className="h-[300px] pr-4">
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : permissions.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        Bu proje için ek erişim izni verilmiş kullanıcı bulunmuyor.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {permissions.map((perm) => (
                            <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={perm.user?.avatar_url} />
                                        <AvatarFallback>{perm.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">{perm.user?.full_name}</p>
                                        <p className="text-xs text-zinc-500">{perm.user?.email}</p>
                                    </div>
                                </div>
                                <MasterButton 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => handleRevoke(perm.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </MasterButton>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        )}

        {activeTab === 'add' && (
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                    <Input 
                        placeholder="Kullanıcı ara..." 
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800 focus:border-blue-500"
                    />
                </div>

                <ScrollArea className="h-[250px]">
                    {searchLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                             {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">{user.full_name}</p>
                                            <p className="text-xs text-zinc-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <MasterButton 
                                        size="sm" 
                                        variant="primary"
                                        className="h-8"
                                        onClick={() => handleGrant(user.id)}
                                    >
                                        Ekle
                                    </MasterButton>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery.length > 1 ? (
                        <div className="text-center py-8 text-zinc-500">
                            Kullanıcı bulunamadı.
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            Aramak için en az 2 karakter girin.
                        </div>
                    )}
                </ScrollArea>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
