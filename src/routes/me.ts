import { Hono } from "hono";
import * as db from "../db/bookings.js"
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types/env.js";

export const meApp = new Hono<AppEnv>()

meApp.get("/bookings", requireAuth, async (c) => {
    const sb = c.get("supabase")
    const user = c.get("user")!

    const [made, recieved] = await Promise.all([
        db.listMyBookings(sb, user.id),
        db.listBookingsOnMyProperties(sb, user.id)
    ])
    return c.json({ made, recieved })
})