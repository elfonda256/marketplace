import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in.",
  );
}

/**
 * One client for server and browser. There is no login, so it always acts as the
 * public role and row level security decides what it may read and write.
 *
 * Session handling is switched off completely: with token auto-refresh on, the auth
 * client re-checks the session whenever the tab regains focus, and in testing that
 * left later uploads waiting on its lock and never sending a request.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
