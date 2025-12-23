export interface IUser {
    id: number;
    telegram_id: number;
    email: string | null;
    first_name: string;
    last_name: string;
    phone_number: string | undefined;
    photo_url: string | null;
    allergies: string[] | null;
    date_of_birth: string | null | undefined;
    mailing_enabled: boolean;
    complete_onboarding: boolean;
    permissions: TUserPermission[];
}

type TUserPermission = 'tester' | 'hospitality_heroes';

export interface IUserUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    allergies?: string[] | null;
    date_of_birth?: string;
}

export interface IUserPreferences {
    preferences: [{
        category: 'mood' | 'menu' | 'events',
        choices: string[]
    }]
}

export interface IAuthInfo {
    access_token: string;
    expires_in: number;
}
