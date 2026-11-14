import { InboxIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  icon?: LucideIcon
  action?: ReactNode
}

export function EmptyState({ title, icon: Icon = InboxIcon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{title}</p>
      {action}
    </div>
  )
}
