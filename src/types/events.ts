import { IUser } from '@/atoms/userAtom.ts';

interface EventRestaurant {
    id: number;
    title: string;
    address: string;
    thumbnail_photo: string;
}

export interface EventTicket {
    id: number;
    event_title: string;
    event_img: string;
    event_description: string;
    date_start: string;
    guest_count: number;
    total: number;
    restaurant: EventRestaurant;
}

export interface IEventInRestaurant {
    name: string;
    description: string;
    ticket_price: number;
    image_url: string;
    date_start: string;
    tickets_left: number;
}

export interface IEventTicketScanner extends EventTicket {
    is_confirmed: boolean;
    user: IUser;
}
