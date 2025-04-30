import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IAuthInfo, IUser } from '@/atoms/userAtom.ts';

interface AuthParams {
    data?: string;
    code?: string;
}

export const APIUserAuth = async (
    data: string | undefined,
    start: string | undefined
) => {
    const params = <AuthParams>{
        data: data,
    };
    if (start) {
        params.code = start;
    }
    return await axios.post<IAuthInfo>(
        `${BASE_URL}/auth/validate`,
        {},
        {
            params: params,
        }
    );
};

export const APIUserInfo = async (access_token: string) => {
    return await axios.get<IUser>(`${BASE_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};
