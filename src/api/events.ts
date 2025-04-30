import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { EventTicket } from '@/types/events.ts';

export const APIGetEvents = async () => {
    return await axios.get<IEvent[]>(`${BASE_URL}/events`);
};

export const APIGetAvailableEventTimeslots = async (
    event_id: number,
    restaurant_id: number,
    guestCount: number,
    token: string
) => {
    return await axios.post<ITimeSlot[]>(
        `${BASE_URL}/events/availableTimeslots`,
        {
            event_id,
            restaurant_id,
            guestCount,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

interface Invoice {
    payment_url: string | null;
}

export const APICreateInvoice = async (
    restaurant_id: number,
    event_id: number,
    timeslot: ITimeSlot,
    name: string,
    phone: string,
    email: string,
    commentary: string,
    confirmation: string,
    guest_count: number,
    token: string
) => {
    return await axios.post<Invoice>(
        `${BASE_URL}/events/invoice`,
        {
            restaurant_id,
            event_id,
            timeslot,
            name,
            phone,
            email,
            commentary,
            confirmation,
            guest_count,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

interface IValidatePayment {
    status: 'new' | 'finished' | 'cancelled';
    booking_id?: number;
}

export const APIValidatePayment = async (id: number, token: string) => {
    return await axios.get<IValidatePayment>(
        `${BASE_URL}/events/validate_payment`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                id,
            },
        }
    );
};

export const APIGetTicket = async (id: number, token: string) => {
    return await axios.get<EventTicket>(`${BASE_URL}/events/tickets/one`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            id,
        },
    });
};

export const APIGetTickets = async (token: string) => {
    return await axios.get<EventTicket[]>(`${BASE_URL}/events/tickets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
