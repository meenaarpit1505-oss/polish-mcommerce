import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isValid = url && url.startsWith("http") && key && key !== "your-supabase-anon-key";

  return createBrowserClient(
    isValid ? url : "https://placeholder-please-set-your-supabase-url.supabase.co",
    isValid ? key : "placeholder-key"
  );
}
