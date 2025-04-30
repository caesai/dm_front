import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IUser } from '@/atoms/userAtom.ts';

export interface IUserUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    allergies?: string;
    date_of_birth?: string;
}

export const APIUpdateUserInfo = async (
    {
        first_name,
        last_name,
        date_of_birth,
        phone_number,
        allergies,
        email,
    }: IUserUpdate,
    access_token: string
) => {
    let payload = {};
    first_name ? (payload = { ...payload, first_name }) : null;
    last_name ? (payload = { ...payload, last_name }) : null;
    date_of_birth ? (payload = { ...payload, date_of_birth }) : null;
    phone_number ? (payload = { ...payload, phone_number }) : null;
    allergies ? (payload = { ...payload, allergies }) : null;
    email ? (payload = { ...payload, email }) : null;

    return await axios.patch<IUser>(`${BASE_URL}/user/me`, payload, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

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
