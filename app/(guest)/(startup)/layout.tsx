import type { FC } from "react"

import { Outlet } from "react-router"

import loginBackground from "@/assets/login.webp"

import { Brand } from "@/components/Brand"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"

const Layout: FC = () => (
    <main className="bg-background grid min-h-full grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-svh flex-col p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
                <Brand />
                <ThemeSwitcher variant="outline" />
            </div>
            <div className="flex flex-auto items-center justify-center py-12">
                <div className="w-full max-w-sm">
                    <Outlet />
                </div>
            </div>
        </div>
        <div
            className="hidden bg-cover bg-bottom lg:block"
            style={{ backgroundImage: `linear-gradient(to bottom, transparent, oklch(0 0 0 / 0.1)), url(${loginBackground})` }}
        />
    </main>
)

export default Layout
