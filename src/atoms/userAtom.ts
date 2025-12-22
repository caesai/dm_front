import { atom } from 'jotai';
import { IAuthInfo, IUser } from '@/types/user.types.ts';

interface IReviewAtom {
    available: boolean;
    loading: boolean;
}

export const userAtom = atom<IUser>();
export const authAtom = atom<IAuthInfo>();

export const reviewAtom = atom<IReviewAtom>({
    available: false,
    loading: true,
});

// export const isUserInGuestListAtom = atom<boolean>(false);