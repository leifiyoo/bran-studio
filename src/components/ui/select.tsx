import * as React from 'react'
import { cn } from '@/lib/cn'

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('focus-ring h-9 w-full rounded-md border border-border bg-panel-strong px-2 text-sm outline-none', props.className)} />
}
