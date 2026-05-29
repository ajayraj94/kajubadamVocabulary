/**
 * Supabase browser client & auth helpers
 * Use this in client components ("use client")
 */
import { createBrowserClient } from "@supabase/ssr";
import { storeUserInfo, logout as clearLocalData } from "./access";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Auth Helpers ──

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
}

/** Sign out from Google */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearLocalData();
}

/** Get current session */
export async function getSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Get current user */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Store user info from session into localStorage */
export function syncUserInfo(session: any) {
  const user = session?.user;
  if (user) {
    storeUserInfo(
      user.email || "",
      user.user_metadata?.full_name || user.user_metadata?.name || "",
      user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
    );
  }
}

/** Listen for auth state changes (call once in root layout) */
export function onAuthStateChange(callback: (session: any) => void) {
  const supabase = createClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}
