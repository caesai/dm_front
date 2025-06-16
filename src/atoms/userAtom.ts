import { atom } from 'jotai';

interface IUserAdmin {
    is_active: boolean;
}

export interface IUser {
    email?: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    allergies?: string;
    early_access: boolean;
    license_agreement: boolean;
    advertisement_agreement: boolean;
    gdpr_agreement: boolean;
    date_of_birth?: string;
    administrator?: IUserAdmin;
    complete_onboarding: boolean;
}

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
