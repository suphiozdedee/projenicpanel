
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MasterButton from "@/components/MasterButton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, UserPlus, MoreVertical } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function AdminPanelDialog({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsers(profiles || []);
    } catch (error) {
        console.error('Error fetching users:', error);
        toast({
            variant: "destructive",
            title: "Hata",
            description: "Kullanıcı listesi alınamadı."
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border-zinc-800 text-white h-[80vh] flex flex-col p-0 gap-0 sm:max-w-[900px]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <div>
                <DialogTitle className="text-xl font-bold">Yönetici Paneli</DialogTitle>
                <DialogDescription className="text-zinc-400 mt-1">
                    Sistem kullanıcılarını ve rollerini yönetin.
                </DialogDescription>
            </div>
            <MasterButton variant="primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Kullanıcı Ekle
            </MasterButton>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-black/50">
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="rounded-lg border border-zinc-800 overflow-hidden bg-[#0a0a0a]">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400 pl-6 h-12">Kullanıcı</TableHead>
                                <TableHead className="text-zinc-400 h-12">E-posta</TableHead>
                                <TableHead className="text-zinc-400 h-12">Rol</TableHead>
                                <TableHead className="text-zinc-400 h-12">Durum</TableHead>
                                <TableHead className="text-right text-zinc-400 pr-6 h-12">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        Henüz kullanıcı bulunmuyor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                                        <TableCell className="font-medium text-white pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-zinc-700 bg-zinc-800">
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                                        {user.full_name?.substring(0,2).toUpperCase() || 'US'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span>{user.full_name || 'İsimsiz Kullanıcı'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 capitalize font-normal">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 font-normal">
                                                Aktif
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <MasterButton variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800">
                                                <MoreVertical className="w-4 h-4" />
                                            </MasterButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
