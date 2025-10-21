export interface IUser {
    id: number;
    telegram_id: number;
    email: string | null;
    first_name: string;
    last_name: string;
    phone_number?: string;
    photo_url: string | null;
    allergies: string[] | null;
    early_access: boolean;
    license_agreement: boolean;
    advertisement_agreement: boolean;
    gdpr_agreement: boolean;
    date_of_birth: string | null | undefined;
    mailing_enabled: boolean;
    administrator: IUserAdmin | null;
    complete_onboarding: boolean;
    username?: string;
}

interface IUserAdmin {
    is_active: boolean;
}

export interface IUserUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    allergies?: string;
    date_of_birth?: string;
}

export interface IUserPreferences {
    preferences: [{
        category: 'mood' | 'menu' | 'events',
        choices: string[]
    }]
}
