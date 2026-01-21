
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function CardButton({ 
  children, 
  variant = 'primary', 
  className, 
  icon: Icon,
  loading = false,
  disabled = false,
  asChild = false,
  ...props 
}) {
  // Map custom variants to MasterButton variants
  const variantMap = {
    primary: 'default',
    secondary: 'outline', 
    danger: 'destructive',
    ghost: 'ghost'
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      variant={variantMap[variant] || variant}
      className={cn(
        "w-full justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-[#FF6200] focus-visible:ring-offset-2",
        // Custom styling for secondary to ensure it matches 'transparent with border' dark theme look perfectly
        variant === 'secondary' && "bg-transparent border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 text-zinc-300 hover:text-white",
        className
      )}
      disabled={isDisabled}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
          ) : (
            Icon && <Icon className="w-4 h-4 mr-1" />
          )}
          {children}
        </>
      )}
    </Button>
  );
}
