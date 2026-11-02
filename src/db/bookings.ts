import type { SupabaseServerClient } from "../types/env.js";
import type {
  Booking,
  BookingUpdate,
  BookingWithProperty,
  NewBooking,
} from "../types/bookings.js";
import { DbError } from "../lib/dbErrors.js";

export async function listBookings(
  sb: SupabaseServerClient,
  property_id: string,
): Promise<Booking[]> {
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("property_id", property_id)
    .order("check_in", { ascending: true });
  if (error) throw new DbError(error);
  return (data ?? []) as Booking[];
}

export async function listMyBookings(
  sb: SupabaseServerClient,
  userId: string,
): Promise<BookingWithProperty[]> {
  const { data, error } = await sb
    .from("bookings")
    .select("*, properties(id, title, location)")
    .eq("user_id", userId)
    .order("check_in", { ascending: true });
  if (error) throw new DbError(error)
    return (data ?? []) as unknown as BookingWithProperty[]
}

export async function listBookingsOnMyProperties(
  sb: SupabaseServerClient,
  userId: string,
): Promise<BookingWithProperty[]> {
  const { data, error } = await sb
    .from("bookings")
    .select("*, properties!inner(id, title, location, owner_id)")
    .eq("properties.owner_id", userId)
    .order("check_in", { ascending: true });
  if (error) throw new DbError(error);
  return (data ?? []) as unknown as BookingWithProperty[];
}

export async function createBooking(
  sb: SupabaseServerClient,
  property_id: string,
  booking: NewBooking,
): Promise<Booking> {
  const { data, error } = await sb
    .from("bookings")
    .insert({ ...booking, property_id: property_id, total_price: 0 })
    .select()
    .single();
  if (error) throw new DbError(error);
  return data as Booking;
}

export async function updateBooking(
  sb: SupabaseServerClient,
  property_id: string,
  bookingId: string,
  updates: BookingUpdate,
): Promise<Booking | null> {
  const { data, error } = await sb
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("property_id", property_id)
    .select()
    .maybeSingle();
  if (error) throw new DbError(error);
  return data as Booking | null;
}

export async function deleteBooking(
  sb: SupabaseServerClient,
  propertyId: string,
  bookingId: string,
): Promise<Booking | null> {
  const { data, error } = await sb
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("property_id", propertyId)
    .select()
    .maybeSingle();
  if (error) throw new DbError(error);
  return data as Booking | null;
}
