import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const propertySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  location: z.string().trim().min(1, "Location is required"),
  price_per_night: z.number().int().positive("Price must be greater than 0"),
  max_guests: z.number().int().positive("Max guests must be greater than 0"),
  image_url: z.url("Image URL must be a valid URL").nullable().optional(),
});

const partialPropertySchema = propertySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, "At least one field is required");

const paramSchema = z.object({
  id: z.uuid("Property id must be a valid UUID"),
});

// Query strings are always text, so z.coerce turns "500" into 500.
const listQuerySchema = z.object({
  location: z.string().trim().min(1).optional(),
  max_price: z.coerce.number().int().positive().optional(),
  guests: z.coerce.number().int().positive().optional(),
  sort: z.enum(["price_asc", "price_desc"]).optional(),
});

export const validateProperty = zValidator("json", propertySchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid data", issues: result.error.issues }, 400);
  }
});

export const validatePartialProperty = zValidator("json", partialPropertySchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid data", issues: result.error.issues }, 400);
  }
});

export const validatePropertyParam = zValidator("param", paramSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid id", issues: result.error.issues }, 400);
  }
});

export const validateListQuery = zValidator("query", listQuerySchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid query", issues: result.error.issues }, 400);
  }
});