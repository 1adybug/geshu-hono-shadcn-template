import { type FC, Fragment } from "react"

import { CurrentUserProfile } from "@/components/CurrentUserProfile"

import { useCurrentUser } from "@/hooks/useCurrentUser"

const Page: FC = () => {
    const { data } = useCurrentUser()
    if (!data?.user) return null

    return (
        <Fragment>
            <title>个人中心 · 格数科技</title>
            <CurrentUserProfile data={data.user} allowUpdateNickname={data.allowUpdateNickname} allowUpdatePhoneNumber={data.allowUpdatePhoneNumber} />
        </Fragment>
    )
}

export default Page
