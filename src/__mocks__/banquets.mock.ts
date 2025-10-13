import {
    IBanquet,
    IBanquetParams,
} from '@/types/banquets.ts';

export const banquetData: IBanquet = {
    "banquet_options": [
        {
            "id": 14,
            "name": "Банкетная рассадка",
            "guests_min": 8,
            "guests_max": 11,
            "deposit": 5000,
            "deposit_message": null,
            "service_fee": 10,
            "images": [
                "https://storage.yandexcloud.net/dreamteam-storage/3790ff7670bf4f1bb045cf2d37646bfa.jpg"
            ]
        },
        {
            "id": 15,
            "name": "Банкетная рассадка",
            "guests_min": 12,
            "guests_max": 19,
            "deposit": 10000,
            "deposit_message": null,
            "service_fee": 10,
            "images": [
                "https://storage.yandexcloud.net/dreamteam-storage/14a57e50743c4cde8fe830afcf3ab938.jpg"
            ]
        },
        {
            "id": 16,
            "name": "Банкетная рассадка",
            "guests_min": 20,
            "guests_max": 40,
            "deposit": 15000,
            "deposit_message": null,
            "service_fee": 10,
            "images": [
                "https://storage.yandexcloud.net/dreamteam-storage/f187c97f96ab43f8be1c34ff3eefac78.JPG"
            ]
        }
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

export const banquetParams: IBanquetParams = {
    min_guests_number: 6,
    max_guests_number: 20,
    banquetType: ['День рождения', 'Свадьба', 'Важный повод', 'Корпоратив', 'Другое'],
    deposit_per_person: 4000,
    service_fee: 10,
};
