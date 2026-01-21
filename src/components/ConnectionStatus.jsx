
import React, { useEffect, useState } from 'react';
import { connectionManager } from '@/lib/supabaseConnectionManager';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ConnectionStatus() {
  const [status, setStatus] = useState('connected'); // connected, disconnected

  useEffect(() => {
    // Sync with connection manager
    const updateStatus = (isConnected) => {
        setStatus(isConnected ? 'connected' : 'disconnected');
    };

    // Initial state
    updateStatus(connectionManager.isConnected);

    // Subscribe
    const unsubscribe = connectionManager.onConnectionChange(updateStatus);
    return () => unsubscribe();
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 border cursor-help",
            status === 'connected' 
              ? "bg-green-500/10 text-green-500 border-green-500/20" 
              : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            <div className="relative flex h-2 w-2">
               <span className={cn(
                 "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                 status === 'connected' ? "bg-green-500" : "bg-red-500"
               )}></span>
               <span className={cn(
                 "relative inline-flex rounded-full h-2 w-2",
                 status === 'connected' ? "bg-green-500" : "bg-red-500"
               )}></span>
            </div>
            
            <span className="hidden sm:inline">
                {status === 'connected' ? 'Bağlı' : 'Bağlantı Yok'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
          <p>Sistem Durumu: {status === 'connected' ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Veri senkronizasyonu {status === 'connected' ? 'aktif' : 'duraklatıldı'}.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
