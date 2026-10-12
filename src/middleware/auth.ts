import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createSupabaseForRequest } from "../lib/supabase.js";
import type { AppEnv } from "../types/env.js";

export const optionalAuth = createMiddleware<AppEnv>(async (c, next) => {
  const supabase = createSupabaseForRequest(c);
  c.set("supabase", supabase);

  const { data, error } = await supabase.auth.getUser();
  c.set("user", error ? null : data.user);

  await next();
});

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  await next();
});