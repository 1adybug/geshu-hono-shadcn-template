import { type ComponentProps, type FC, useId, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { getErrorMessage } from "deepsea-tools"
import { LoaderCircleIcon } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"

import { authClient } from "@/utils/authClient"
import { toast } from "@/utils/toast"

export interface LogoutProps extends ComponentProps<typeof Button> {}

export const Logout: FC<LogoutProps> = ({ children = "注销", disabled, onClick: _onClick, ...rest }) => {
    const key = useId()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isPending, setIsPending] = useState(false)

    async function onSignOut() {
        if (isPending) return

        setIsPending(true)
        toast.loading("注销中...", { id: key })

        try {
            const response = await authClient.signOut({})

            if (response.error) throw new Error(response.error.message || "注销失败")

            await queryClient.invalidateQueries({ queryKey: ["current-user"] })
            toast.success("已注销", { id: key })
            navigate("/", { replace: true })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: key })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Button
            disabled={disabled || isPending}
            onClick={event => {
                void onSignOut()
                _onClick?.(event)
            }}
            {...rest}
        >
            {isPending && <LoaderCircleIcon className="animate-spin" />}
            {children}
        </Button>
    )
}
