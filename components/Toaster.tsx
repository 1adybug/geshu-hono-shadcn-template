"use client"

import type { FC } from "react"

import { CircleCheckIcon, CircleXIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { Toaster as HotToaster, toast, ToastBar } from "react-hot-toast"

export const Toaster: FC = () => (
    <HotToaster
        containerStyle={{
            top: 16,
            right: 16,
            bottom: 16,
            left: 16,
        }}
        gutter={8}
        position="top-center"
        reverseOrder={false}
        toastOptions={{
            duration: 4000,
            style: {
                maxWidth: "min(28rem, calc(100vw - 2rem))",
                padding: "0.75rem 0.875rem",
                color: "var(--popover-foreground)",
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 12px 32px color-mix(in oklab, var(--foreground) 12%, transparent)",
            },
            success: {
                duration: 3500,
                icon: <CircleCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />,
            },
            error: {
                duration: 5000,
                icon: <CircleXIcon className="text-destructive size-5" />,
            },
            loading: {
                duration: Infinity,
                icon: <LoaderCircleIcon className="text-primary size-5 animate-spin" />,
            },
        }}
    >
        {currentToast => (
            <ToastBar toast={currentToast}>
                {({ icon, message }) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-5 flex-none items-center justify-center">{icon}</span>
                        <div className="min-w-0 flex-1 text-sm leading-5 font-medium">{message}</div>
                        {currentToast.type !== "loading" && (
                            <button
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ml-1 inline-flex size-6 flex-none items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                type="button"
                                aria-label="关闭通知"
                                onClick={() => toast.dismiss(currentToast.id)}
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </ToastBar>
        )}
    </HotToaster>
)
