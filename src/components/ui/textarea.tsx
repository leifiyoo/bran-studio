import * as React from 'react'
import { cn } from '@/lib/cn'

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('focus-ring min-h-20 w-full rounded-md border border-border bg-panel-strong px-3 py-2 text-sm outline-none', props.className)} />
}
