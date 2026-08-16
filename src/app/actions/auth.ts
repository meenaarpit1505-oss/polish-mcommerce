"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, AuthenticatedUser } from "@/lib/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: AuthenticatedUser;
}

// Check if Supabase env vars are properly set up
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.startsWith("http") && key && key !== "your-supabase-anon-key");
}

/**
 * Server Action for signing up a new user securely with Supabase
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const fullName = formData.get("fullName")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Server-side validation
  if (!fullName.trim() || !email.trim() || !password) {
    return { success: false, error: "missing_fields" };
  }

  const formattedEmail = email.toLowerCase().trim();

  // Basic email pattern check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formattedEmail)) {
    return { success: false, error: "invalid_email" };
  }

  // Password requirements check (8+ chars, 1 number, 1 special char)
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasMinLength || !hasNumber || !hasSpecial) {
    return { success: false, error: "weak_password" };
  }

  if (!isSupabaseConfigured()) {
    // Mock successful signup for premium interactive demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Register user on Supabase Auth
    const { error } = await supabase.auth.signUp({
      email: formattedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        return { success: false, error: "already_exists" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign up action error:", error);
    return { success: false, error: "internal_error" };
  }
}

/**
 * Server Action for logging in a user securely with Supabase
 */
export async function logInAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email.trim() || !password) {
    return { success: false, error: "missing_fields" };
  }

  const formattedEmail = email.toLowerCase().trim();

  if (!isSupabaseConfigured()) {
    // Mock successful login for premium interactive demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password,
    });

    if (error) {
      // If user isn't found or credentials incorrect, map to existing error keys for standard UI error notifications
      if (
        error.message.includes("Invalid login credentials") || 
        error.message.includes("invalid claim") ||
        error.message.includes("Email not confirmed")
      ) {
        // If email not found vs wrong password isn't explicitly separated by Supabase for security,
        // we can default to "wrong_password" or "email_not_found". Let's use "wrong_password"
        // as a standard catch-all credential error.
        return { success: false, error: "wrong_password" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Log in action error:", error);
    return { success: false, error: "internal_error" };
  }
}

/**
 * Server Action for logging out a user securely
 */
export async function logOutAction(): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Log out action error:", error);
    return { success: false, error: "internal_error" };
  }
}

/**
 * Server Action to check session and return current user details
 */
export async function getCurrentUserAction(): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "not_authenticated" };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "not_authenticated" };
    }
    return { success: true, user };
  } catch (error) {
    console.error("Get current user action error:", error);
    return { success: false, error: "internal_error" };
  }
}
