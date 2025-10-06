import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
// import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { EventTicket, IEventInRestaurant, ISuperEventHasApplicationResponse } from '@/types/events.ts';

export const APIGetEvents = async () => {
    return await axios.get<IEventInRestaurant[]>(`${BASE_URL}/events/`);
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
    booking_id: number;
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
    // status: 'new' | 'finished' | 'cancelled';
    // booking_id?: number;
    event_id?: number;
    paid: boolean;
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

export const APIPostSuperEventCheckLink = async (token: string) => {
    return await axios.post(`${BASE_URL}/events/super_events/check_link`,null, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIGetSuperEventHasApplication = async ( token: string ) => {
    return await axios.get<ISuperEventHasApplicationResponse>(`${BASE_URL}/events/super_events/has_application`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIPostSuperEventCreateApplication = async (
    token: string,
    {
        name,
        surname,
        phone,
        work_place,
        job_title,
        experience,
        visit_purpose,
    }: {
        name: string,
        surname: string,
        phone: string,
        work_place: string,
        job_title: string,
        experience: string,
        visit_purpose: string,
    },
) => {
    return await axios.post(`${BASE_URL}/events/super_events/create_application`,{
        name,
        surname,
        phone,
        work_place,
        job_title,
        experience,
        visit_purpose,
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIGetSuperEventHasAccess = async ( token: string ) => {
    return await axios.get(`${BASE_URL}/events/super_events/has_access`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIDeleteTicket = async (event_id: number, token: string) => {
    return await axios.delete<EventTicket>(`${BASE_URL}/events/cancel/${event_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};


export const APIGetAvailableEventTimeSlots = (
    token: string,
    restaurant_id: number,
    guestCount: number,
    event_id: number,
) => {
    return axios.post(
        `${BASE_URL}/events/availableTimeslots`,
        {
            guestCount,
            restaurant_id,
            event_id,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },

        }
    );
};
