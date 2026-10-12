import type { User } from "@supabase/supabase-js";
import type { createServerClient } from "@supabase/ssr";

export type SupabaseServerClient = ReturnType<typeof createServerClient>;

export type AppEnv = {
  Variables: {
    supabase: SupabaseServerClient;
    user: User | null;
  };
};