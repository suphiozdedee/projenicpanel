import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentActivity({ projects, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-zinc-700 text-zinc-300';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'Approved': return 'bg-[#FF6200]/20 text-[#FF6200] border-[#FF6200]/20';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/20';
      default: return 'bg-zinc-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#0a0a0a] border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded bg-zinc-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                <Skeleton className="h-3 w-1/4 bg-zinc-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-10 bg-[#0a0a0a] border border-zinc-800 rounded-xl">
        <p className="text-zinc-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card key={project.id} className="bg-[#0a0a0a] border-zinc-800 hover:border-zinc-700 transition-colors group">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs group-hover:text-[#FF6200] group-hover:border-[#FF6200]/30 transition-colors">
                {project.brand.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{project.brand}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.start_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.city}
                  </span>
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className={`border-none ${getStatusColor(project.status)}`}>
              {project.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}