import { createClient } from "./supabase/server";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

// Check if Supabase env vars are properly set up
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.startsWith("http") && key && key !== "your-supabase-anon-key");
}

/**
 * Retrieves the current authenticated user session securely from Supabase
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Retrieve full_name from the public profiles table (or fall back to user_metadata)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.fullName || "User";

    return {
      id: user.id,
      email: user.email || "",
      fullName,
      createdAt: user.created_at,
    };
  } catch (error) {
    console.error("Error fetching current user from Supabase:", error);
    return null;
  }
}
