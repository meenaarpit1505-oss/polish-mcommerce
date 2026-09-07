import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isHttpUrl(value: string | undefined): value is string {
  return Boolean(value && value.startsWith("http"));
}

export function isSupabaseAdminConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (
    isHttpUrl(url) &&
    Boolean(serviceKey) &&
    serviceKey !== "your-supabase-service-role-key"
  );
}

/** Server-only client. Never import this from a Client Component. */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseAdminConfigured() || !url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
