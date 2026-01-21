
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color, trend, description, loading }) {
  // Extract color classes or use safe defaults
  // Assuming color prop comes as "from-blue-500 to-blue-600" or similar gradients
  // We'll try to extract a primary color for the icon background
  
  if (loading) {
    return (
      <Card className="bg-[#0A0A0A] border-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
            <Skeleton className="h-4 w-12 bg-zinc-800" />
          </div>
          <Skeleton className="h-8 w-16 mb-2 bg-zinc-800" />
          <Skeleton className="h-4 w-24 bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A0A0A]/40 backdrop-blur-md border-white/5 hover:bg-[#121212]/80 hover:border-white/10 transition-all duration-300 group overflow-hidden relative">
      {/* Top Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${color} opacity-30`} />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 bg-clip-padding backdrop-filter backdrop-blur-sm border border-white/5 shadow-inner`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                trend === 'up' 
                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                : 'text-red-400 bg-red-400/10 border-red-400/20'
            }`}>
              {trend === 'up' ? '↗' : '↘'}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-white font-display tracking-tight">{value}</h3>
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
        </div>
        
        {description && (
          <p className="text-xs text-zinc-600 mt-3 pt-3 border-t border-white/5">
            {description}
          </p>
        )}
      </CardContent>
      
      {/* Hover Glow Effect */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity duration-500 pointer-events-none`} />
    </Card>
  );
}
