import { createClient } from "./supabase/server";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  image?: string;
  updatedAt: string;
}

/**
 * Upserts a user record into the database.
 * If Supabase is configured, it writes to the 'profiles' table with a fallback.
 * If not, it simulates and logs a fully realized database entry to support decoupled local testing.
 */
export async function dbUpsertUser(user: UserRecord): Promise<{ success: boolean; data?: any; error?: any }> {
  console.log(`[DB Placeholder] Initiating upsert for user: ${user.email} (${user.id})`);
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(url && url.startsWith("http") && key && key !== "your-supabase-anon-key");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      
      // Attempt upsert into profiles (matching existing 'full_name' conventions seen in auth.ts)
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email.toLowerCase().trim(),
          full_name: user.name,
          avatar_url: user.image || null,
          updated_at: user.updatedAt,
        }, { onConflict: "id" })
        .select();

      if (error) {
        console.warn(`[DB Placeholder] Profiles upsert error, trying fallback to custom 'users' table: ${error.message}`);
        
        // Fallback: Try a generic 'users' table if the schema differs
        const { data: userData, error: userError } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            email: user.email.toLowerCase().trim(),
            name: user.name,
            image: user.image || null,
            updated_at: user.updatedAt,
          }, { onConflict: "id" })
          .select();

        if (userError) {
          console.error(`[DB Placeholder] Failure in both 'profiles' and 'users' table writes:`, userError.message);
          return { success: false, error: userError.message };
        }
        
        return { success: true, data: userData };
      }

      console.log(`[DB Placeholder] Successfully upserted user in Supabase profiles: ${user.email}`);
      return { success: true, data };
    } catch (err: any) {
      console.error("[DB Placeholder] Serverless context exception during DB storage execution:", err);
      return { success: false, error: err.message || err };
    }
  } else {
    // Elegant fallback simulation to avoid pipeline blockages during developer-onboarding phases
    console.log("[DB Placeholder] Supabase not configured. Simulating absolute storage-state entry successfully:", {
      ...user,
      storageStatus: "committed_simulated_db_transaction",
      timestamp: new Date().toISOString(),
    });
    return { 
      success: true, 
      data: { 
        simulated: true, 
        persistedAt: new Date().toISOString(),
        record: user 
      } 
    };
  }
}
