import type { ContentfulStatusCode } from "hono/utils/http-status";

export function mapDbError(
  error: unknown,
): { status: ContentfulStatusCode; message: string } | null {
  if (typeof error !== "object" || error === null || !("code" in error))
    return null;
  switch ((error as { code: string }).code) {
    case "23P01":
      return {
        status: 409,
        message: "The property is already booked for these dates",
      };
    case "23503":
      return { status: 404, message: "Property not found" };
    case "23514":
      return { status: 400, message: "Invalid data" };
    case "SF001":
      return { status: 400, message: "Too many guests for this property" };
    case "SF002":
      return { status: 400, message: "Property and guest cannot be changed" };
    case "SF003":
      return { status: 409, message: "A cancelled booking cannot be changed" };
    case "SF004":
      return { status: 409, message: "A booking cannot go back to pending" };
    case "SF005":
      return {
        status: 403,
        message: "Only the property owner can confirm a booking",
      };
    default:
      return null;
  }
}

export class DbError extends Error {
  code: string;
  constructor(source: { message: string; code: string }) {
    super(source.message);
    this.code = source.code;
  }
}
