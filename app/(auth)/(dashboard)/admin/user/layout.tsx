import { type FC, Fragment } from "react"

import { Outlet } from "react-router"

const Layout: FC = () => (
    <Fragment>
        <title>用户管理 · 格数科技</title>
        <Outlet />
    </Fragment>
)

export default Layout
