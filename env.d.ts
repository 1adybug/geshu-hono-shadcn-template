/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
    readonly PUBLIC_BETTER_AUTH_URL?: string
    readonly PUBLIC_TIME_ZONE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
