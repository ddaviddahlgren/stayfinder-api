import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import type { AppEnv } from "./types/env.js";
import { optionalAuth } from "./middleware/auth.js";
import { mapDbError } from "./lib/dbErrors.js";
import { authApp } from "./routes/auth.js";
import { propertiesApp } from "./routes/properties.js";
import { bookingsApp } from "./routes/bookings.js";

const app = new Hono<AppEnv>({ strict: false });

app.use(
  "*",
  cors({
    origin: env.frontendUrl,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use("*", optionalAuth);

app.get("/", (c) => c.text("StayFinder API"));

app.route("/auth", authApp);

app.route("/properties", propertiesApp);

app.route("/properties/:propertyId/bookings", bookingsApp);

app.notFound((c) => c.json({ error: "Route not found" }, 404));

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  const mapped = mapDbError(error);
  if (mapped) {
    return c.json({ error: mapped.message }, mapped.status);
  }
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
