import { IUser } from '@/atoms/userAtom.ts';
import { IRestaurantShortBooking } from '@/types/restaurant.ts';

interface EventRestaurant {
    id: number;
    title: string;
    address: string;
    thumbnail_photo: string;
}

export interface EventTicket {
    id: number;
    remarked_id: number;
    event_title: string;
    event_img: string;
    event_description: string;
    date_start: string;
    date_end: string;
    guest_count: number;
    total: number;
    phone?: string;
    restaurant: EventRestaurant;
}

export interface IEventInRestaurant {
    id: number;
    name: string;
    description: string;
    ticket_price: number;
    image_url: string;
    date_start: string;
    date_end: string;
    tickets_left: number;
    restaurant: IRestaurantShortBooking
}

export interface IEventTicketScanner extends EventTicket {
    is_confirmed: boolean;
    user: IUser;
}

export interface IEventBooking {
    event?: IEventInRestaurant;
    restaurant?: EventRestaurant;
    guestCount?: number;
}

export interface ISuperEventHasApplicationResponse {
    has_application: boolean;
}
