import type { FC } from "react"

import { Link } from "react-router"

import { Brand } from "@/components/Brand"
import { Logout } from "@/components/Logout"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { useUser } from "@/components/UserProvider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { UserRole } from "@/schemas/userRole"

const Page: FC = () => {
    const user = useUser()

    return (
        <main className="bg-muted/30 min-h-full">
            <title>首页 · 格数科技</title>
            <header className="bg-background border-b">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Brand />
                    <ThemeSwitcher variant="outline" />
                </div>
            </header>
            <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20 sm:px-6">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">格数科技项目模板</CardTitle>
                        <CardDescription>用于快速搭建账户、权限、日志与系统设置能力。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user ? (
                            <div className="space-y-4">
                                <div className="bg-muted rounded-2xl p-4">
                                    <div className="font-medium">{user.nickname}</div>
                                    <div className="text-muted-foreground mt-1 text-sm">{user.name}</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button render={<Link to="/profile" />} nativeButton={false}>
                                        进入个人中心
                                    </Button>
                                    {user.role === UserRole.管理员 && (
                                        <Button render={<Link to="/admin/user" />} variant="outline" nativeButton={false}>
                                            用户管理
                                        </Button>
                                    )}
                                    <Logout variant="ghost" />
                                </div>
                            </div>
                        ) : (
                            <Button render={<Link to="/login" />} nativeButton={false}>
                                登录系统
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default Page
