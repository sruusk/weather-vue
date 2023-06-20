/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OPEN_WEATHER: string,
    readonly VITE_DEFAULT_LANG: string,
    readonly VITE_EXECUTION_NUMBER: any
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
