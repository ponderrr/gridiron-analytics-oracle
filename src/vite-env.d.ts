/// <reference types="vite/client" />

/**
 * Vite client-side environment variables
 *
 * @property VITE_SUPABASE_URL - The Supabase project URL (required)
 * @property VITE_SUPABASE_ANON_KEY - The Supabase anon/public key (required)
 * @property VITE_APP_TITLE - The application title (optional)
 * @property VITE_DEBUG - Enable debug mode in the client (optional)
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Edge Function environment variables (for reference)
 *
 * SUPABASE_URL: string - The Supabase project URL (required)
 * SUPABASE_SERVICE_ROLE_KEY: string - The Supabase service role key (required for server-side)
 * SUPABASE_ANON_KEY: string - The Supabase anon/public key (required for some edge functions)
 * DEBUG: string - Enable debug mode (optional)
 * NODE_ENV: string - Node/Deno environment (optional)
 */
