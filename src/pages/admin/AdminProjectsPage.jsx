import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Eye, ExternalLink, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchAllProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*, created_by_profile:created_by(full_name)')
        .order('created_at', { ascending: false });
      if (data) setProjects(data);
    }
    fetchAllProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-display">Tüm Projeler</h1>
        <p className="text-zinc-400">Sistemdeki tüm projelerin ham listesi.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-white font-medium">{project.brand}</h3>
                   <Badge className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800">{project.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                   <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.fair_event}</span>
                   <span>•</span>
                   <span>Temsilci: {project.created_by_profile?.full_name || 'Bilinmiyor'}</span>
                </div>
             </div>
             
             <div className="text-right text-xs text-zinc-600 font-mono">
                ID: {project.id}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}