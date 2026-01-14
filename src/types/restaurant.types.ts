import { ICity } from '@/atoms/cityListAtom.ts';
import { IBanquet } from '@/types/banquets.types.ts';

export interface IRestaurantChef {
    names: string[];
    avatars: string[];
    about: string;
    photo_url: string;
}

export interface IPhotoCard {
    id: number;
    category: string;
    url: string;
}

export interface ISocialnetwork {
    type: string;
    url: string;
    name: string;
}

export interface IWorkTime {
    weekday: string;
    time_start: string;
    time_end: string;
}

export interface IMenuItem {
    id: number;
    title: string;
    photo_url: string;
    price: number;
}

export interface IDishDetailed {
    id: number;
    title: string;
    photo_url: string;
    price: number;
    weight?: string; // граммовка
    description?: string; // состав
    calories?: number;
    proteins?: number;
    fats?: number;
    carbohydrates?: number;
    allergens?: string[];
    category_id: number;
}

export interface IMenuCategory {
    id: number;
    name: string;
    dishes: IDishDetailed[];
}

export interface IMenuImg {
    id: number;
    image_url: string;
    order: number;
}

export interface IRestaurantShort {
    id: string;
    title: string;
    slogan: string;
    address: string;
    logo_url: string;
    thumbnail_photo: string;
    openTime: string;
    avg_cheque: number;
    photo_cards: IPhotoCard[];
    brand_chef: IRestaurantChef;
    city: ICity;
    banquets: IBanquet;
}

export interface IRestaurantShortBooking {
    id: string;
    title: string;
    address: string;
    address_lonlng?: string;
    thumbnail_photo: string;
}

export interface IRestaurant extends IRestaurantShort {
    about_text: string;
    about_kitchen: string;
    about_features: string;
    address_lonlng: string;
    address_station: string;
    address_station_color: string;
    phone_number: string;
    gallery: IPhotoCard[];
    menu: IMenuItem[];
    menu_imgs: IMenuImg[];
    worktime: IWorkTime[];
    socials: ISocialnetwork[];
}

export interface IBookingCreate {
    error: any;
    id: number;
    ticket_id?: number;
}

export interface IBookingInfo {
    id: string;
    restaurant: IRestaurantShortBooking;
    booking_date: string;
    time: string;
    guests_count: number;
    children_count: number;
    booking_status: string;
    user_comments: string;
    tags: string;
    booking_type?: string;
    event_title?: string;
    title?: string;
    duration: number;
    certificate_value: number;
    certificate_expired_at: string;
}

export interface ICurrentBookings {
    currentBookings: IBookingInfo[];
}

export interface IIsReviewAvailable {
    available: boolean;
}
