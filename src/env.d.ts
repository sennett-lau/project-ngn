/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_AIR_KIT_PARTNER_ID: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
