import * as React from 'react'
import { cn } from '@/lib/cn'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('focus-ring h-9 w-full rounded-md border border-border bg-panel-strong px-3 text-sm outline-none', props.className)} />
}
