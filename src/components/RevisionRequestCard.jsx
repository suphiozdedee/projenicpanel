
import React, { useState } from 'react';
import { Loader2, AlertTriangle, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export default function RevisionRequestCard({ project, onUpdate }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Default to 'pending' if null or undefined
  const currentStatus = project.revision_status || 'pending';

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Revize İste',
          color: 'bg-red-600 hover:bg-red-700',
          nextStatus: 'in_progress',
          icon: AlertTriangle
        };
      case 'in_progress':
        return {
          label: 'Revizeye Başlandı',
          color: 'bg-orange-600 hover:bg-orange-700',
          nextStatus: 'completed',
          icon: Play
        };
      case 'completed':
        return {
          label: 'Revize Bitti',
          color: 'bg-green-600 hover:bg-green-700',
          nextStatus: 'pending',
          icon: CheckCircle2
        };
      default:
        return {
          label: 'Revize İste',
          color: 'bg-red-600 hover:bg-red-700',
          nextStatus: 'in_progress',
          icon: AlertTriangle
        };
    }
  };

  const config = getStatusConfig(currentStatus);
  const Icon = config.icon;

  const handleStatusCycle = async (e) => {
    e.stopPropagation(); // Prevent row click
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          revision_status: config.nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      if (onUpdate) onUpdate();

    } catch (error) {
      console.error("Revision status update error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Revize durumu güncellenemedi."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project.revision_requested) return null;

  return (
    <Button 
      onClick={handleStatusCycle}
      disabled={loading}
      className={`${config.color} text-white shadow-lg transition-all duration-200 hover:scale-105 min-w-[160px]`}
      size="sm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Icon className="h-4 w-4 mr-2" />
      )}
      {config.label}
    </Button>
  );
}
