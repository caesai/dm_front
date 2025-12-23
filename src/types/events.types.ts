import { IRestaurantShortBooking } from '@/types/restaurant.types.ts';
import { IUser } from '@/types/user.types.ts';
import { Dispatch, SetStateAction } from 'react';

export interface IEvent {
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
    ticket_identifier: number;
    restaurant: EventRestaurant;
}

export interface IEventTicketScanner extends EventTicket {
    is_confirmed: boolean;
    user: IUser;
}

export interface IEventBooking extends IEvent {
    restaurantId: string;
    guestCount: number;
}

export type IEventBookingContext = [
    IEventBooking | null,
    Dispatch<SetStateAction<IEventBooking | null>>,
];

export interface ISuperEventHasApplicationResponse {
    has_application: boolean;
}
