import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import {
    IBookingCreate,
    IBookingInfo,
    ICurrentBookings,
    IIsReviewAvailable,
    IRestaurant,
} from '@/types/restaurant.ts';
import { IEventInRestaurant } from '@/types/events.ts';

export const APIGetRestaurants = () => {
    return axios.get<IRestaurant[]>(`${BASE_URL}/restaurant/list`);
};

export const APIGetAvailableDays = (
    token: string,
    restaurant_id: number,
    guests: number
) => {
    return axios.get<string[]>(
        `${BASE_URL}/restaurant/${restaurant_id}/availableDays`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                guests: guests,
            },
        }
    );
};

export const APIGetAvailableTimeSlots = (
    token: string,
    restaurant_id: number,
    d: string,
    guests: number
) => {
    return axios.get(
        `${BASE_URL}/restaurant/${restaurant_id}/availableTimeslots`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                guests,
                d,
            },
        }
    );
};

export const APICreateBooking = (
    token: string,
    restaurant_id: number,
    date: string,
    time: string,
    guests_count: number,
    name: string,
    phone: string,
    email: string,
    comment: string,
    prepared_comments: string[],
    confirmation: string
) => {
    return axios.post<IBookingCreate>(
        `${BASE_URL}/restaurant/${restaurant_id}/booking`,
        {
            date,
            time,
            guests_count,
            name,
            phone,
            email,
            comment,
            prepared_comments,
            confirmation,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIGetBooking = (token: string, id: number) => {
    return axios.get<IBookingInfo>(`${BASE_URL}/booking/info`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            booking_id: id,
        },
    });
};

export const APIGetMyBookings = (token: string) => {
    return axios.get<IBookingInfo[]>(`${BASE_URL}/booking/list`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const APICancelBooking = (token: string, booking_id: number) => {
    return axios.delete(`${BASE_URL}/booking/cancel/${booking_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const APIIsReviewAvailable = (token: string) => {
    return axios.get<IIsReviewAvailable>(
        `${BASE_URL}/booking/review/available`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIGetCurrentBookings = (token: string) => {
    return axios.get<ICurrentBookings>(`${BASE_URL}/booking/currentBookings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const APISendReview = (
    token: string,
    rate: number,
    features: string[],
    comment: string
) => {
    return axios.post(
        `${BASE_URL}/booking/review/new`,
        {
            rate: rate,
            features: features.toString(),
            comment: comment,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIGetEventsInRestaurant = async (restaurant_id: number) => {
    return await axios.get<IEventInRestaurant[]>(
        `${BASE_URL}/restaurant/${restaurant_id}/events`
    );
};
