import type { ComponentProps, FC } from "react"

import { type StrictOmit, clsx } from "deepsea-tools"
import { Link } from "react-router"

import geshuLogo from "@/assets/geshu.svg"

export interface BrandClassNames {
    mainWrapper?: string
    link?: string
    logoWrapper?: string
    logo?: string
    text?: string
}

export interface BrandProps extends StrictOmit<ComponentProps<"h1">, "children"> {
    classNames?: BrandClassNames
}

export const Brand: FC<BrandProps> = ({ classNames: { mainWrapper, link, logoWrapper, logo, text } = {}, className, ...rest }) => (
    <h1 className={clsx(mainWrapper, className)} {...rest}>
        <Link className={clsx("flex items-center gap-3", link)} to="/">
            <div className={clsx("flex flex-none", logoWrapper)}>
                {/* 如果你使用的不是 geshu.svg 作为这里的 logo，请不要应用 -translate-y-[7.03%] */}
                <img src={geshuLogo} alt="logo" width={32} className={clsx("h-8 w-8 -translate-y-[7.03%]", logo)} />
            </div>
            <div className={clsx("text-lg font-bold", text)}>格数科技项目模板</div>
        </Link>
    </h1>
)
