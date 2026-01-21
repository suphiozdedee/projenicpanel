
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/* 
  MasterButton - The core button component for the application.
  Features comprehensive variants, sizes, and micro-interactions.
*/

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6200] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] hover:scale-[1.02]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#FF6200] to-[#FF8C42] text-white shadow-sm hover:shadow-md hover:brightness-110 border border-transparent",
        primary: "bg-gradient-to-r from-[#FF6200] to-[#FF8C42] text-white shadow-sm hover:shadow-md hover:brightness-110 border border-transparent",
        secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg border border-transparent",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg border border-transparent",
        outline: "bg-transparent text-zinc-900 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600",
        ghost: "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
        link: "text-[#FF6200] underline-offset-4 hover:underline p-0 h-auto bg-transparent shadow-none hover:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const MasterButton = React.forwardRef(({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
  // Safe handling for asChild:
  // If asChild is true, we cannot safely inject the Loader2 icon because Slot expects a single React element child.
  // The consumer must handle loading state visuals within the child component if asChild is true.
  
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})
MasterButton.displayName = "MasterButton"

export { MasterButton, buttonVariants }
export default MasterButton
