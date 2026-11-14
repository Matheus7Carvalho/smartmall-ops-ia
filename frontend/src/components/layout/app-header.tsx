import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from '@/features/auth/components/user-menu'

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <span className="truncate text-sm text-muted-foreground">Capim Dourado Shopping</span>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  )
}
