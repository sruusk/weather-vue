/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OPEN_WEATHER: string,
    readonly VITE_DEFAULT_LANG: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
