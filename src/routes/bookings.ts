import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import * as db from "../db/bookings.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateBookingParam,
  validateBookingUpdate,
  validateNewBooking,
  validatePropertyParam,
} from "../validators/bookings.js";
import type { AppEnv } from "../types/env.js";

export const bookingsApp = new Hono<AppEnv>();

bookingsApp.get("/", requireAuth, validatePropertyParam, async (c) => {
  const sb = c.get("supabase");
  const { propertyId } = c.req.valid("param");
  return c.json(await db.listBookings(sb, propertyId));
});

bookingsApp.post(
  "/",
  requireAuth,
  validatePropertyParam,
  validateNewBooking,
  async (c) => {
    const sb = c.get("supabase");
    const { propertyId } = c.req.valid("param");
    const body = c.req.valid("json");
    const booking = await db.createBooking(sb, propertyId, body);
    return c.json(booking, 201);
  },
);

bookingsApp.patch(
  "/:bookingId",
  requireAuth,
  validateBookingParam,
  validateBookingUpdate,
  async (c) => {
    const sb = c.get("supabase");
    const { propertyId, bookingId } = c.req.valid("param");
    const updates = c.req.valid("json");

    const updated = await db.updateBooking(sb, propertyId, bookingId, updates);
    if (!updated)
      throw new HTTPException(404, { message: "Booking not found" });
    return c.json(updated);
  },
);

bookingsApp.delete(
  "/:bookingId",
  requireAuth,
  validateBookingParam,
  async (c) => {
    const sb = c.get("supabase");
    const { propertyId, bookingId } = c.req.valid("param");

    const deleted = await db.deleteBooking(sb, propertyId, bookingId);
    if (!deleted)
      throw new HTTPException(404, { message: "Booking not found" });
    return c.json({ message: "Booking deleted" });
  },
);
