import React from 'react';
import { Mail, Shield, UserX, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const USERS = [
  { id: 1, name: 'Alice Admin', email: 'admin@tradeshow.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Builder', email: 'designer@tradeshow.com', role: 'Designer', status: 'Active' },
  { id: 3, name: 'Charlie Client', email: 'client@brand.com', role: 'Client', status: 'Active' },
  { id: 4, name: 'Dave Developer', email: 'dev@nexus.com', role: 'Developer', status: 'Inactive' },
];

function PersonnelPanel() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Personnel Management</h2>
          <p className="text-slate-400">Manage user access and roles</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">Invite User</Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm">
            <tr>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {USERS.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    user.role === 'Designer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${
                    user.status === 'Active' ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      user.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'
                    }`} />
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PersonnelPanel;