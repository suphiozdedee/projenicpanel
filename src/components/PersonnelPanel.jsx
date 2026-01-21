import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PersonnelPanel() {
  const users = [
    { id: 1, name: 'Alex Johnson', role: 'Admin', email: 'alex@nexus.com', status: 'online', avatar: 'A' },
    { id: 2, name: 'Sarah Miller', role: 'Lead Designer', email: 'sarah@nexus.com', status: 'busy', avatar: 'S' },
    { id: 3, name: 'Mike Ross', role: 'Production Manager', email: 'mike@nexus.com', status: 'offline', avatar: 'M' },
    { id: 4, name: 'Emma Watson', role: 'Brand Rep', email: 'emma@client.com', status: 'online', avatar: 'E' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Personnel Management</h2>
          <p className="text-slate-400 text-sm">Manage team access and roles</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">Add Member</Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white">
                  {user.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                  user.status === 'online' ? 'bg-green-500' : 
                  user.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                }`}></div>
              </div>
              
              <div>
                <h3 className="text-white font-medium">{user.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {user.role}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                user.role.includes('Designer') ? 'bg-orange-500/20 text-orange-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {user.role}
              </span>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PersonnelPanel;