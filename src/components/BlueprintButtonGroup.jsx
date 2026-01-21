
import React from 'react';
import { cn } from '@/lib/utils';

const BlueprintButtonGroup = ({ children, className, direction = 'vertical' }) => {
  return (
    <div className={cn(
      "flex w-full gap-4 relative p-1",
      direction === 'vertical' ? 'flex-col' : 'flex-row items-center',
      className
    )}>
      {/* Decorative Group Binding Line */}
      <div className={cn(
        "absolute bg-orange-500/10 pointer-events-none",
        direction === 'vertical' 
            ? "left-[-8px] top-4 bottom-4 w-[1px] border-l border-dashed border-orange-500/20" 
            : "bottom-[-8px] left-4 right-4 h-[1px] border-b border-dashed border-orange-500/20"
      )} />
      
      {children}
    </div>
  );
};

export default BlueprintButtonGroup;
