
import React from 'react';
import { cn } from '@/lib/utils';

export function CardButtonGroup({ children, className }) {
  return (
    <div className={cn("flex flex-col gap-2 w-full mt-auto pt-4 border-t border-white/5", className)}>
      {children}
    </div>
  );
}

export function CardButtonGrid({ children, className }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 w-full", className)}>
      {children}
    </div>
  );
}

export default CardButtonGroup;
