import type { SupabaseServerClient } from "../types/env.js";
import type { NewProperty, Property, PropertyFilters } from "../types/property.js";

export async function listProperties(
  sb: SupabaseServerClient,
  filters: PropertyFilters,
): Promise<Property[]> {
  let query = sb.from("properties").select("*");

  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.max_price) query = query.lte("price_per_night", filters.max_price);
  if (filters.guests) query = query.gte("max_guests", filters.guests);

  // G8: sorting happens in the database, not in the frontend
  if (filters.sort) {
    query = query.order("price_per_night", { ascending: filters.sort === "price_asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function getPropertyById(
  sb: SupabaseServerClient,
  id: string,
): Promise<Property | null> {
  const { data, error } = await sb
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Property | null;
}

// owner_id is not sent: the column defaults to auth.uid() and the RLS
// insert policy rejects any row where owner_id is not the caller.
export async function createProperty(
  sb: SupabaseServerClient,
  property: NewProperty,
): Promise<Property> {
  const { data, error } = await sb
    .from("properties")
    .insert(property)
    .select()
    .single();
  if (error) throw error;
  return data as Property;
}

// RLS hides rows the caller can't change, so a non-owner gets zero rows back.
export async function updateProperty(
  sb: SupabaseServerClient,
  id: string,
  updates: Partial<NewProperty>,
): Promise<Property | null> {
  const { data, error } = await sb
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Property | null;
}

export async function deleteProperty(
  sb: SupabaseServerClient,
  id: string,
): Promise<Property | null> {
  const { data, error } = await sb
    .from("properties")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Property | null;
}