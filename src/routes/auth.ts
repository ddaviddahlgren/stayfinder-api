import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types/env.js";

const credentialsSchema = z.object({
  email: z.email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const validateCredentials = zValidator("json", credentialsSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid data", issues: result.error.issues }, 400);
  }
});

export const authApp = new Hono<AppEnv>();

authApp.post("/register", validateCredentials, async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c.get("supabase").auth.signUp({ email, password });

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ user: data.user }, 201);
});

authApp.post("/login", validateCredentials, async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c
    .get("supabase")
    .auth.signInWithPassword({ email, password });

  if (error) return c.json({ error: "Invalid credentials" }, 401);
  return c.json({ user: data.user });
});

authApp.get("/me", requireAuth, (c) => {
  return c.json({ user: c.get("user") });
});

authApp.post("/logout", requireAuth, async (c) => {
  const { error } = await c.get("supabase").auth.signOut();
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ message: "Logged out" });
});