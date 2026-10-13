import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const bookingShape = z.object({
  guest_name: z.string().trim().min(1, "Guest name is required"),
  guest_email: z.email("Valid email is required"),
  check_in: z.iso.date("Check-in must be a date (YYYY-MM-DD)"),
  check_out: z.iso.date("Check-out must be a date (YYYY-MM-DD)"),
  guests: z.number().int().positive("Guests must be greater than 0"),
});

const checkOutAfterCheckIn = (b: { check_in?: string; check_out?: string }) =>
  !b.check_in || !b.check_out || b.check_out > b.check_in;

const dateMessage = {
  message: "Check-out must be after check-in",
  path: ["check_out"],
};

const createSchema = bookingShape.refine(checkOutAfterCheckIn, dateMessage);

const updateSchema = bookingShape
  .partial()
  .extend({ status: z.enum(["pending", "confirmed", "cancelled"]).optional() })
  .refine((b) => Object.keys(b).length > 0, "At least one field is required")
  .refine(checkOutAfterCheckIn, dateMessage);

const propertyParamSchema = z.object({
  propertyId: z.uuid("Invalid property id"),
});
const bookingParamSchema = propertyParamSchema.extend({
  bookingId: z.uuid("Invalid booking id"),
});

const onFail = (message: string) => (result: any, c: any) => {
  if (!result.success) {
    return c.json({ error: message, issues: result.error.issues }, 400);
  }
};

export const validateNewBooking = zValidator(
  "json",
  createSchema,
  onFail("Invalid data"),
);
export const validateBookingUpdate = zValidator(
  "json",
  updateSchema,
  onFail("Invalid data"),
);
export const validatePropertyParam = zValidator(
  "param",
  propertyParamSchema,
  onFail("Invalid id on property"),
);
export const validateBookingParam = zValidator(
  "param",
  bookingParamSchema,
  onFail("Invalid id on booking"),
);
