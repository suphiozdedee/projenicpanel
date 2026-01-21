
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Shield, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCog
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/customSupabaseClient';
import { safeQuery } from '@/lib/networkUtils';

import CreateUserDialog from '@/components/CreateUserDialog';
import EditUserDialog from '@/components/EditUserDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Profiles
      const { data: profiles, error: profileError } = await safeQuery(
        () => supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        { errorMessage: 'Kullanıcılar yüklenemedi.' }
      );
      if (profileError) throw profileError;

      // 2. Fetch Revenue Permissions
      const { data: permissions } = await safeQuery(
        () => supabase.from('revenue_permissions').select('user_id'),
        { silent: true }
      );

      const permSet = new Set((permissions || []).map(p => p.user_id));
      
      const merged = (profiles || []).map(p => ({
        ...p,
        revenueAccess: permSet.has(p.id)
      }));

      setUsers(merged);
    } catch (err) {
      console.error(err);
      setError('Veri alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const onActionSuccess = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = (user.full_name?.toLowerCase() || '').includes(s) || 
                            (user.email?.toLowerCase() || '').includes(s);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-20 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-6 rounded-xl border border-zinc-800 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <UserCog className="w-8 h-8 text-[#FF6200]" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Sistem kullanıcılarını, rollerini ve yetkilerini yönetin.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <Button variant="outline" onClick={fetchUsers} className="border-zinc-700 bg-black hover:bg-zinc-900 text-zinc-300">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
           </Button>
           <Button onClick={() => setIsCreateOpen(true)} className="bg-[#FF6200] hover:bg-[#FF6200]/90 text-white shadow-lg shadow-orange-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Kullanıcı Ekle
           </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="İsim veya e-posta ile ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#0A0A0A] border-zinc-800 text-white focus:border-[#FF6200] h-10 rounded-lg"
            />
         </div>
         <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
               <SelectTrigger className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 h-10 rounded-lg">
                  <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> <SelectValue placeholder="Rol Filtrele" /></div>
               </SelectTrigger>
               <SelectContent className="bg-[#111111] border-zinc-800 text-zinc-300">
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  <SelectItem value="admin">Yönetici (Admin)</SelectItem>
                  <SelectItem value="user">Kullanıcı (User)</SelectItem>
                  <SelectItem value="designer">Tasarımcı (Designer)</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>

      {/* Content */}
      <Card className="bg-[#0A0A0A] border-zinc-800 shadow-xl overflow-hidden">
         <CardContent className="p-0">
            <Table>
               <TableHeader className="bg-[#111111]">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                     <TableHead className="text-zinc-500 font-medium pl-6">Kullanıcı</TableHead>
                     <TableHead className="text-zinc-500 font-medium">Rol</TableHead>
                     <TableHead className="text-zinc-500 font-medium">Ciro Erişimi</TableHead>
                     <TableHead className="text-zinc-500 font-medium">Durum</TableHead>
                     <TableHead className="text-right text-zinc-500 font-medium pr-6">İşlemler</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {loading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                           <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                              <Loader2 className="w-8 h-8 animate-spin text-[#FF6200]" />
                              <span className="text-sm">Yükleniyor...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : error ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                           <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                              <Shield className="w-8 h-8" />
                              <span>{error}</span>
                              <Button variant="link" onClick={fetchUsers}>Tekrar Dene</Button>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center text-zinc-500">
                           Kayıt bulunamadı.
                        </TableCell>
                     </TableRow>
                  ) : (
                      paginatedUsers.map((user) => (
                         <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                            <TableCell className="pl-6 py-4">
                               <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-zinc-800">
                                     <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                        {(user.full_name || 'U').substring(0,2).toUpperCase()}
                                     </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                     <span className="text-zinc-200 font-medium text-sm">{user.full_name || 'İsimsiz'}</span>
                                     <span className="text-zinc-500 text-xs">{user.email}</span>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <Badge variant="outline" className={`
                                  capitalize font-normal
                                  ${user.role === 'admin' ? 'border-red-500/20 bg-red-500/10 text-red-400' : ''}
                                  ${user.role === 'designer' ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' : ''}
                                  ${user.role === 'user' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : ''}
                               `}>
                                  {user.role}
                               </Badge>
                            </TableCell>
                            <TableCell>
                               {user.revenueAccess ? (
                                  <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">Açık</Badge>
                               ) : (
                                  <Badge variant="outline" className="text-zinc-500 border-zinc-700">Kapalı</Badge>
                               )}
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`} />
                                  <span className="text-sm text-zinc-400 capitalize">{user.status !== 'suspended' ? 'Aktif' : 'Askıda'}</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                        <MoreVertical className="w-4 h-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-[#111111] border-zinc-800 text-zinc-300">
                                     <DropdownMenuItem onClick={() => handleEdit(user)}>
                                        <Edit className="w-4 h-4 mr-2" /> Düzenle
                                     </DropdownMenuItem>
                                     <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDelete(user)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Sil
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </TableCell>
                         </TableRow>
                      ))
                  )}
               </TableBody>
            </Table>
         </CardContent>
         
         {/* Pagination */}
         <div className="border-t border-zinc-800 p-4 flex items-center justify-between bg-[#0A0A0A]">
            <div className="text-xs text-zinc-500">
               Toplam <span className="text-zinc-300 font-medium">{filteredUsers.length}</span> kullanıcıdan <span className="text-zinc-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> arası gösteriliyor
            </div>
            <div className="flex gap-2">
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-zinc-700 bg-transparent text-zinc-400 hover:text-white"
               >
                  <ChevronLeft className="w-4 h-4" />
               </Button>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-zinc-700 bg-transparent text-zinc-400 hover:text-white"
               >
                  <ChevronRight className="w-4 h-4" />
               </Button>
            </div>
         </div>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={onActionSuccess} 
      />
      
      <EditUserDialog 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSuccess={onActionSuccess} 
        user={selectedUser} 
      />
      
      <DeleteConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onSuccess={onActionSuccess} 
        user={selectedUser} 
      />
    </div>
  );
}
