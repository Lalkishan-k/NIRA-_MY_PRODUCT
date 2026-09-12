/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module 'canvas-confetti' {
  export default function confetti(options?: any): Promise<null | undefined>;
}

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_STORE_NAME?: string;
  readonly VITE_STORE_TAGLINE?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_SUPPORT_PHONE?: string;
  readonly VITE_FREE_SHIPPING_THRESHOLD?: string;
  readonly VITE_SHIPPING_CHARGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
