import type { FC } from "react"

import { Outlet } from "react-router"

import { DashboardSidebar } from "@/components/DashboardSidebar"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const Layout: FC = () => (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="bg-muted/30 min-h-0 min-w-0 overflow-hidden">
            <header className="bg-background flex h-14 flex-none items-center gap-2 border-b px-3 md:hidden">
                <SidebarTrigger />
                <div className="min-w-0 flex-auto truncate text-sm font-semibold">格数科技项目模板</div>
                <ThemeSwitcher size="icon-sm" />
            </header>
            <main className="min-h-0 flex-auto overflow-auto">
                <div className="mx-auto min-h-full w-full max-w-[1600px] p-4 sm:p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
)

export default Layout
