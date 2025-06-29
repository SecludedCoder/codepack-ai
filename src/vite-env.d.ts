/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}