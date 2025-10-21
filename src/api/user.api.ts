import axios from 'axios';
import {BASE_URL} from '@/api/base.ts';
import { IUser, IUserPreferences } from '@/types/user.types.ts';

export const APIUpdateUserInfo = async (
    {
        first_name,
        last_name,
        date_of_birth,
        phone_number,
        allergies,
        email,
    }: IUser,
    access_token: string
) => {
    let payload = {};
    first_name ? (payload = {...payload, first_name}) : null;
    last_name ? (payload = {...payload, last_name}) : null;
    date_of_birth ? (payload = {...payload, date_of_birth}) : null;
    phone_number ? (payload = {...payload, phone_number}) : null;
    allergies ? (payload = {...payload, allergies}) : null;
    email ? (payload = {...payload, email}) : null;

    return await axios.patch<IUser>(`${BASE_URL}/user/me`, payload, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

export const APIDeleteUser = async (
    access_token: string
) => {
    return await axios.post<IUser>(`${BASE_URL}/user/delete_me`, {}, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
}

export const APICompleteOnboarding = async (token: string, agree: boolean) => {
    return await axios.patch<IUser>(
        `${BASE_URL}/user/agreement`,
        {
            agree: agree,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIUserName = async (token: string, first_name: string, last_name: string = '') => {
    return await axios.patch<IUser>(
        `${BASE_URL}/user/me`,
        {
            first_name,
            last_name,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIUserPreferences = async (token: string, data: IUserPreferences) => {
    return await axios.post(
        `${BASE_URL}/user-preferences/user/bulk-update`, data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};
