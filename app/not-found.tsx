import { type FC, Fragment } from "react"

import notFoundImage from "@/assets/404.webp"

import { ErrorPage } from "@/components/ErrorPage"

const NotFound: FC = () => (
    <Fragment>
        <title>页面未找到 · 格数科技</title>
        <ErrorPage code={404} title="页面未找到" description="抱歉，你似乎来到了一片无人区..." href="/" link="回到首页" image={notFoundImage} />
    </Fragment>
)

export default NotFound
