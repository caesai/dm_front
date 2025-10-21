import { atom } from 'jotai';
import { IUser } from '@/types/user.types.ts';

interface IReviewAtom {
    available: boolean;
    loading: boolean;
}

export interface IAuthInfo {
    access_token: string;
    expires_in: number;
}

export const userAtom = atom<IUser>();
export const authAtom = atom<IAuthInfo>();

export const reviewAtom = atom<IReviewAtom>({
    available: false,
    loading: true,
});
