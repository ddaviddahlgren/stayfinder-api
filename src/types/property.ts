export interface NewProperty {
    title: string,
    description: string,
    location: string,
    price_per_night: number,
    max_guests: number,
    image_url?: string | null
}

export interface Property extends NewProperty {
    id: string,
    owner_id: string,
    created_at: string
}

export type PropertySort = "price_asc" | "price_desc"

export interface PropertyFilters {
    location?: string,
    max_price?: number,
    guests?: number,
    sort?: PropertySort
}