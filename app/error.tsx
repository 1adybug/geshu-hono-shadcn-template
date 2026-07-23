import { type FC, Fragment } from "react"

import { useRouteError } from "react-router"

import errorImage from "@/assets/500.webp"

import { ErrorPage } from "@/components/ErrorPage"

const ErrorBoundary: FC = () => {
    const error = useRouteError()
    const description = error instanceof Error ? error.message : "抱歉，服务器似乎打了一个盹..."

    return (
        <Fragment>
            <title>服务器错误 · 格数科技</title>
            <ErrorPage code={500} title="服务器错误" description={description} href="/" link="回到首页" image={errorImage} />
        </Fragment>
    )
}

export default ErrorBoundary
