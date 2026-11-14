import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* min-w-0: conteúdo largo (ex.: quadro Kanban) rola dentro de si, sem alargar a página. */}
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
