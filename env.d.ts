/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Adresse du serveur des jeux en ligne quand il est hébergé ailleurs (voir lib/server.ts) */
  readonly VITE_SERVER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
