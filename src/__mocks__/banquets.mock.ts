import { IBanquet, IBanquetOptions } from '@/types/banquets.types.ts';
import { IBanquetFormState } from '@/atoms/banquetFormAtom.ts';

export const banquetData: IBanquet = {
    "banquet_options": [
        {
            'id': 14,
            'name': 'Банкетная рассадка',
            'guests_min': 8,
            'guests_max': 11,
            'deposit': 5000,
            'deposit_message': null,
            'service_fee': 10,
            'max_duration': null,
            'images': [
                'https://storage.yandexcloud.net/dreamteam-storage/3790ff7670bf4f1bb045cf2d37646bfa.jpg',
            ],
            description: null,
        },
        {
            'id': 15,
            'name': 'Банкетная рассадка',
            'guests_min': 12,
            'guests_max': 19,
            'deposit': 10000,
            'deposit_message': null,
            'service_fee': 10,
            'max_duration': null,
            'images': [
                'https://storage.yandexcloud.net/dreamteam-storage/14a57e50743c4cde8fe830afcf3ab938.jpg',
            ],
            description: null,
        },
        {
            'id': 16,
            'name': 'Банкетная рассадка',
            'guests_min': 20,
            'guests_max': 40,
            'deposit': 15000,
            'deposit_message': null,
            'service_fee': 10,
            'max_duration': null,
            'images': [
                'https://storage.yandexcloud.net/dreamteam-storage/f187c97f96ab43f8be1c34ff3eefac78.JPG',
            ],
            description: null,
        },
    ],
    "additional_options": [
        {
            "id": 33,
            "name": "Цветочное оформление"
        },
        {
            "id": 34,
            "name": "Разработка персонального меню"
        },
        {
            "id": 35,
            "name": "Торт по индивидуальному заказу"
        },
        {
            "id": 36,
            "name": "Медиаоборудование (проектор / плазма)"
        },
        {
            "id": 37,
            "name": "Фотограф"
        }
    ],
    "image": "https://storage.yandexcloud.net/dreamteam-storage/d4fa1466780d435d96b90f637e5d43f2.jpg",
    "description": "Ваши значимые события в Smoke BBQ: банкеты, частные мероприятия, семейные торжества, корпоративные и деловые встречи"
};

/**
 * Мок данных формы банкета для тестирования.
 * Используется в тестах страниц банкетов.
 */
export const mockBanquetFormWithOptions: Partial<IBanquetFormState> = {
    additionalOptions: banquetData.additional_options,
    selectedServices: [],
    restaurantId: '1',
    optionId: '14',
};

/**
 * Типы банкета для тестирования dropdown.
 */
export const banquetTypes = ['День рождения', 'Свадьба', 'Корпоратив', 'Другое'];

/**
 * Моковая банкетная опция с полным описанием.
 * Описание > 60 символов для тестирования "Читать больше".
 */
export const mockBanquetOptionLongDescription: IBanquetOptions = {
    id: 1,
    name: 'Банкетный зал "Премиум"',
    guests_min: 10,
    guests_max: 50,
    deposit: 5000,
    deposit_message: null,
    description: 'Роскошный банкетный зал для проведения свадеб, юбилеев и корпоративных мероприятий. Панорамные окна с видом на город.',
    service_fee: 10,
    max_duration: null,
    images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
    ],
};

/**
 * Моковая банкетная опция с коротким описанием.
 * Описание < 60 символов - кнопка "Читать больше" не отображается.
 */
export const mockBanquetOptionShortDescription: IBanquetOptions = {
    id: 2,
    name: 'Зал "Камерный"',
    guests_min: 5,
    guests_max: 15,
    deposit: 3000,
    deposit_message: null,
    description: 'Уютный зал для небольших компаний.',
    service_fee: 10,
    max_duration: null,
    images: [
        'https://example.com/image3.jpg',
    ],
};

/**
 * Моковая банкетная опция без депозита.
 * Отображает deposit_message вместо суммы.
 */
export const mockBanquetOptionNoDeposit: IBanquetOptions = {
    id: 3,
    name: 'Летняя терраса',
    guests_min: 8,
    guests_max: 30,
    deposit: null,
    deposit_message: 'Депозит обсуждается индивидуально',
    description: null,
    service_fee: 0,
    max_duration: null,
    images: [
        'https://example.com/image4.jpg',
    ],
};

/**
 * Моковая банкетная опция без депозита и без сообщения.
 * Отображает "Без депозита".
 */
export const mockBanquetOptionFreeDeposit: IBanquetOptions = {
    id: 4,
    name: 'VIP-комната',
    guests_min: 2,
    guests_max: 8,
    deposit: null,
    deposit_message: null,
    description: null,
    service_fee: 0,
    max_duration: null,
    images: [
        'https://example.com/image5.jpg',
    ],
};

/**
 * Моковые данные заполненной формы бронирования банкета.
 * Используется для тестирования страницы подтверждения бронирования.
 */
export const mockBanquetFormData: IBanquetFormState = {
    name: 'Банкетный зал "Премиум"',
    date: new Date('2026-02-15'),
    timeFrom: '18:00',
    timeTo: '22:00',
    guestCount: { value: '25', title: '25 человек' },
    currentRestaurant: {
        id: '1',
        title: 'Ресторан "Гурман"',
        slogan: 'Лучший ресторан',
        address: 'ул. Ленина, 1',
        address_lonlng: '30.3158,59.9386',
        address_station: '',
        address_station_color: '',
        logo_url: '',
        thumbnail_photo: '',
        openTime: '12:00',
        avg_cheque: 2500,
        photo_cards: [],
        brand_chef: { names: [], avatars: [], about: '', photo_url: '' },
        city: { id: 2, name: 'Санкт-Петербург', name_english: 'spb', name_dative: 'Санкт-Петербурге' },
        banquets: banquetData,
        about_text: '',
        about_kitchen: '',
        about_features: '',
        phone_number: '',
        gallery: [],
        menu: [],
        menu_imgs: [],
        worktime: [],
        socials: [],
    },
    restaurantId: '1',
    optionId: '14',
    reason: 'День рождения',
    additionalOptions: [
        { id: 1, name: 'Цветочное оформление' },
        { id: 2, name: 'Фотограф' },
    ],
    selectedServices: ['Цветочное оформление', 'Фотограф'],
    withAdditionalPage: true,
    price: {
        deposit: 3000,
        totalDeposit: 75000,
        serviceFee: 10,
        total: 82500,
    },
};
