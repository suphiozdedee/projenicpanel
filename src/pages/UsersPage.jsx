import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Shield, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const USERS = [
  { id: 1, name: 'Alice Freeman', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: 'Oct 24, 2024' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Offline', joined: 'Nov 12, 2024' },
  { id: 3, name: 'Charlie Kim', email: 'charlie@example.com', role: 'Viewer', status: 'Active', joined: 'Dec 01, 2024' },
  { id: 4, name: 'David Lee', email: 'david@example.com', role: 'Admin', status: 'Suspended', joined: 'Jan 15, 2025' },
  { id: 5, name: 'Eva Green', email: 'eva@example.com', role: 'Editor', status: 'Active', joined: 'Feb 20, 2025' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-display mb-1">Team Management</h1>
          <p className="text-zinc-400 font-sans text-sm">Manage access, roles, and permissions.</p>
        </div>
        <Button className="bg-[#FF6200] hover:bg-[#FF6200]/90 text-white font-display tracking-wide">
          + Invite Member
        </Button>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0a0a0a]/60">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 bg-black/40 border-zinc-800 focus:border-[#FF6200] text-sm text-white h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="bg-black/40 border-zinc-800 text-zinc-400 hover:text-white w-full sm:w-auto">
               <Filter className="h-3 w-3 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="bg-black/40 border-zinc-800 text-zinc-400 hover:text-white w-full sm:w-auto">
               Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 font-medium font-sans">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white group-hover:text-[#FF6200] transition-colors">{user.name}</p>
                        <p className="text-zinc-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`
                      ${user.status === 'Active' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : ''}
                      ${user.status === 'Offline' ? 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5' : ''}
                      ${user.status === 'Suspended' ? 'text-red-400 border-red-400/20 bg-red-400/5' : ''}
                    `}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-zinc-800 text-zinc-300">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">Change Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer">Suspend Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}