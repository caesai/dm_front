export interface IBookingForm {
    commentary: string | undefined;
    name: string | undefined;
    phone: string | undefined;
}

export interface ITimeSlot {
    start_datetime: string;
    end_datetime: string;
    is_free: boolean;
}
