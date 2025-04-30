import { ICity } from '@/atoms/cityListAtom.ts';

export interface IRestaurantChef {
    name: string;
    photo_url: string;
    about: string;
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

interface IMenuItem {
    id: number;
    title: string;
    photo_url: string;
    price: number;
}

interface IMenuImg {
    id: number;
    image_url: string;
    order: number;
}

export interface IRestaurantShort {
    id: number;
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
}

export interface IRestaurantShortBooking {
    id: number;
    title: string;
    address: string;
    address_lonlng: string;
    thumbnail_photo: string;
}

export interface IRestaurant extends IRestaurantShort {
    about_text: string;
    about_dishes: string;
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
    id: number;
}

export interface IBookingInfo {
    id: number;
    restaurant: IRestaurantShortBooking;
    booking_date: string;
    time: string;
    guests_count: number;
    booking_status: string;
    user_comments: string;
}

export interface ICurrentBookings {
    currentBookings: IBookingInfo[];
}

export interface IIsReviewAvailable {
    available: boolean;
}
