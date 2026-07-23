import type { FC } from "react"

import { Outlet } from "react-router"

import { Registry } from "@/components/Registry"

const RootLayout: FC = () => (
    <Registry>
        <Outlet />
    </Registry>
)

export default RootLayout
