/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ROUTER_MODE: 'hash' | 'browser';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
