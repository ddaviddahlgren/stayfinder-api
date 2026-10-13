import type { SupabaseServerClient } from "../types/env.js";
import type { Booking, BookingUpdate, NewBooking } from "../types/bookings.js";

export async function listBookings(
  sb: SupabaseServerClient,
  property_id: string,
): Promise<Booking[]> {
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("property_id", property_id)
    .order("check_in", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function createBooking(
  sb: SupabaseServerClient,
  property_id: string,
  booking: NewBooking,
): Promise<Booking> {
  const { data, error } = sb
    .from("bookings")
    .insert({ ...booking, property_id: property_id, total_price: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBooking(
  sb: SupabaseServerClient,
  property_id: string,
  bookingId: string,
  updates: BookingUpdate,
): Promise<Booking | null> {
  const { data, error } = sb
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("property_id", property_id)
    .select()
    .maybeSingle();
  if (error) throw error;
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
  if (error) throw error;
  return data as Booking | null;
}
