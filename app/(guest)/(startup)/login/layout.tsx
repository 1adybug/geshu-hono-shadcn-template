import { type FC, Fragment } from "react"

import { Outlet } from "react-router"

const Layout: FC = () => (
    <Fragment>
        <title>登录 · 格数科技</title>
        <Outlet />
    </Fragment>
)

export default Layout
