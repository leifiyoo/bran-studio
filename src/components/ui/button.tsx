import * as React from 'react'
import { cn } from '@/lib/cn'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'icon' }

export function Button({ className, variant = 'secondary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-md border transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'border-accent bg-accent text-accent-foreground',
        variant === 'secondary' && 'border-border bg-panel-strong hover:bg-muted',
        variant === 'ghost' && 'border-transparent hover:bg-muted',
        variant === 'danger' && 'border-danger bg-danger text-white',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'icon' && 'h-8 w-8 p-0',
        className,
      )}
      {...props}
    />
  )
}
