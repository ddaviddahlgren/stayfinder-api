import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import * as db from "../db/properties.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateListQuery,
  validatePartialProperty,
  validateProperty,
  validatePropertyParam,
} from "../validators/property.js";
import type { AppEnv } from "../types/env.js";

export const propertiesApp = new Hono<AppEnv>();

propertiesApp.get("/", validateListQuery, async (c) => {
  const sb = c.get("supabase");
  const filters = c.req.valid("query");
  return c.json(await db.listProperties(sb, filters));
});

propertiesApp.get("/:id", validatePropertyParam, async (c) => {
  const sb = c.get("supabase");
  const { id } = c.req.valid("param");
  const property = await db.getPropertyById(sb, id);

  if (!property)
    throw new HTTPException(404, { message: "Property not found" });
  return c.json(property);
});

propertiesApp.post("/", requireAuth, validateProperty, async (c) => {
  const sb = c.get("supabase");
  const body = c.req.valid("json");
  const property = await db.createProperty(sb, body);
  return c.json(property, 201);
});

propertiesApp.put(
  "/:id",
  requireAuth,
  validatePropertyParam,
  validatePartialProperty,
  async (c) => {
    const sb = c.get("supabase");
    const { id } = c.req.valid("param");
    const updates = c.req.valid("json");

    const updated = await db.updateProperty(sb, id, updates);
    if (updated) return c.json(updated);

    const exists = await db.getPropertyById(sb, id);
    if (exists) {
      throw new HTTPException(403, { message: "You do not own this property" });
    }
    throw new HTTPException(404, { message: "Property not found" });
  },
);

propertiesApp.delete("/:id", requireAuth, validatePropertyParam, async (c) => {
  const sb = c.get("supabase");
  const { id } = c.req.valid("param");

  const deleted = await db.deleteProperty(sb, id);
  if (deleted) return c.json({ message: "Property deleted" });

  const exists = await db.getPropertyById(sb, id);
  if (exists) {
    throw new HTTPException(403, { message: "You do not own this property" });
  }
  throw new HTTPException(404, { message: "Property not found" });
});