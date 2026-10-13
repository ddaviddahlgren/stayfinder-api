export type BookingStatus = "pending" | "confirmed" | "cancelled"

export interface NewBooking {
    guest_name: string,
    guest_email: string,
    check_in: string,
    check_out: string,
    guests: number
}

export interface Booking extends NewBooking {
    id: string,
    property_id: string,
    user_id: string,
    total_price: number,
    status: BookingStatus,
    created_at: string
}

export type BookingUpdate = Partial<NewBooking> & { status?: BookingStatus}