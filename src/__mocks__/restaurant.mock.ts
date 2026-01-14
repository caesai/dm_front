import { IRestaurant } from "@/types/restaurant.types";
import { banquetData } from '@/__mocks__/banquets.mock.ts';
import newSelfEdgeChinoisThumbnail from '/img/chinois_app.png';

export const mockNewSelfEdgeChinoisRestaurant: IRestaurant = {
    'id': String(99),
    'title': 'Self Edge Chinois',
    'slogan': 'Современная Азия с акцентом на Китай и культовый raw bar',
    'address': 'Санкт-Петербург, ул. Добролюбова, 11',
    'logo_url': '',
    'thumbnail_photo': newSelfEdgeChinoisThumbnail,
    'avg_cheque': 3000,
    'about_text': '',
    'about_kitchen': 'Американская',
    'about_features': '',
    'phone_number': '',
    'address_lonlng': '',
    'address_station': '',
    'address_station_color': '',
    'city': {
        'id': Number(2),
        'name': 'Санкт-Петербург',
        'name_english': 'spb',
        'name_dative': 'Санкт-Петербурге',
    },
    'gallery': [],
    'brand_chef': {
        'names': [],
        'photo_url': '',
        'about': '',
        'avatars': [],
    },
    'worktime': [],
    'menu': [],
    'menu_imgs': [],
    'socials': [],
    'photo_cards': [],
    openTime: "",
    banquets: {
        banquet_options: [],
        additional_options: [],
        description: '',
        image: '',
    },
}

// Restaurant IDs
export const R = {
  BLACKCHOPS_SPB_FONTANKA_RIVER_ID: '1',
  POLY_SPB_BELINSKOGO_ID: '2',
  TRAPPIST_SPB_RADISHEVA_ID: '3',
  SELF_EDGE_SPB_RADISHEVA_ID: '4',
  PAME_SPB_MOIKA_RIVER_ID: '5',
  SMOKE_BBQ_SPB_RUBINSHTEINA_ID: '6',
  SELF_EDGE_EKAT_GOGOLYA: '7',
  SMOKE_BBQ_MSC_TRUBNAYA_ID: '9',
  SELF_EDGE_MSC_BIG_GRUZINSKAYA_ID: '10',
  SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID: '11',
  SELF_EDGE_SPB_CHINOIS_ID: '13',
}

/**
 * Моковый ресторан с банкетными опциями.
 * Содержит все необходимые поля для отображения и навигации.
 */
export const mockRestaurantWithBanquets: IRestaurant = {
    id: '1',
    title: 'Test Restaurant',
    slogan: 'Test Slogan',
    address: 'Test Address, 123',
    address_lonlng: '30.3158,59.9386',
    address_station: 'Невский проспект',
    address_station_color: '#0066cc',
    logo_url: 'https://example.com/logo.jpg',
    thumbnail_photo: 'https://example.com/thumbnail.jpg',
    openTime: '12:00',
    avg_cheque: 2500,
    photo_cards: [],
    brand_chef: {
        names: ['Шеф Повар'],
        avatars: ['https://example.com/chef.jpg'],
        about: 'Описание шефа',
        photo_url: 'https://example.com/chef.jpg',
    },
    city: {
        id: 2,
        name: 'Санкт-Петербург',
        name_english: 'spb',
        name_dative: 'Санкт-Петербурге',
    },
    banquets: banquetData,
    about_text: 'О ресторане',
    about_kitchen: 'О кухне',
    about_features: 'Особенности',
    phone_number: '+7 (999) 123-45-67',
    gallery: [],
    menu: [],
    menu_imgs: [],
    worktime: [
        { weekday: 'пн', time_start: '12:00', time_end: '23:00' },
        { weekday: 'вт', time_start: '12:00', time_end: '23:00' },
        { weekday: 'ср', time_start: '12:00', time_end: '23:00' },
        { weekday: 'чт', time_start: '12:00', time_end: '23:00' },
        { weekday: 'пт', time_start: '12:00', time_end: '00:00' },
        { weekday: 'сб', time_start: '12:00', time_end: '00:00' },
        { weekday: 'вс', time_start: '12:00', time_end: '23:00' },
    ],
    socials: [],
};

/**
 * Моковый ресторан без банкетных опций.
 * Не должен отображаться в списке выбора ресторанов для банкетов.
 */
export const mockRestaurantWithoutBanquets: IRestaurant = {
    ...mockRestaurantWithBanquets,
    id: '2',
    title: 'Restaurant Without Banquets',
    banquets: {
        banquet_options: [],
        additional_options: [],
        description: '',
        image: '',
    },
};

/**
 * Второй моковый ресторан с банкетными опциями.
 * Для тестирования списка ресторанов.
 */
export const mockRestaurantWithBanquets2: IRestaurant = {
    ...mockRestaurantWithBanquets,
    id: '3',
    title: 'Second Restaurant',
    address: 'Second Address, 456',
};

/**
 * Список моковых ресторанов для тестирования.
 * Используется в тестах бронирования.
 */
export const mockRestaurantsList: IRestaurant[] = [
    {
        ...mockRestaurantWithBanquets,
        id: '1',
        title: 'Test Restaurant 1',
        slogan: 'Test Slogan 1',
        address: 'Test Address 1, 123',
        address_lonlng: '30.3158,59.9386',
        address_station: 'Невский проспект',
        address_station_color: '#0066cc',
        about_text: 'О ресторане 1',
        about_kitchen: 'О кухне 1',
        about_features: 'Особенности 1',
    },
    {
        ...mockRestaurantWithBanquets,
        id: '2',
        title: 'Test Restaurant 2',
        slogan: 'Test Slogan 2',
        address: 'Test Address 2, 456',
        address_lonlng: '30.3200,59.9400',
        address_station: 'Маяковская',
        address_station_color: '#ff0000',
        openTime: '11:00',
        avg_cheque: 3000,
        phone_number: '+7 (999) 987-65-43',
        about_text: 'О ресторане 2',
        about_kitchen: 'О кухне 2',
        about_features: 'Особенности 2',
    },
];
