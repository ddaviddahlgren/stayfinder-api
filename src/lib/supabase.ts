import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createServerClient } from "@supabase/ssr";
import { env } from "../env.js";
import type { SupabaseServerClient } from "../types/env.js";

export function createSupabaseForRequest(c: Context): SupabaseServerClient {
  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookie(c)).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(c, name, value, {
            domain: options.domain,
            expires: options.expires,
            maxAge: options.maxAge,
            path: "/",
            httpOnly: true,
            secure: env.isProduction,
            sameSite: "Lax",
          });
        }
      },
    },
  });
}