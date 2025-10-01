import { IEventInRestaurant } from '@/types/events.ts';

export const mockEventsList: IEventInRestaurant[] = [{
    "id": 122,
    "name": "Дегустация чая",
    "description": "Никогда не пили чай?\r\nТогда приходите к нам на дегустацию. Если вы пили чай раньше, вы можете тоже принять участие в мероприятии, так как чай можно пить каждый день.\r\n🍇🍈🍊🍋🍎\r\nЧай - это высушенные и особо обработанные листья некоторых культивируемых вечнозелёных растений, на которых настаивается горячий напиток.",
    "ticket_price": 5,
    "image_url": "",
    "date_start": "2025-08-23 15:00:00",
    "tickets_left": 24,
    "restaurant": {
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "address_lonlng": "",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg"
    }
}, {
    "id": 168,
    "name": "Вечер шеф повара",
    "description": "тестовое мероприятие",
    "ticket_price": 3000,
    "image_url": "",
    "date_start": "2025-08-23 15:00:00",
    "tickets_left": 24,
    "restaurant": {
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "address_lonlng": "",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg"
    }
}, {
    "id": 169,
    "name": "Японский вечер",
    "description": "Японский вечер — атмосферное погружение в культуру Страны восходящего солнца. Вас ждут изысканные блюда японской кухни, живая музыка и уютная атмосфера.",
    "ticket_price": 1500,
    "image_url": "http://cabinet.clientomer.ru/storage/123004/advents/169.jpg",
    "date_start": "2025-08-23 15:00:00",
    "tickets_left": 24,
    "restaurant": {
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "address_lonlng": "",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg"
    },
}, {
    "id": 241,
    "name": "🍨 Встреча любителей высокой кухни",
    "description": "Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие.\r\nБесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Спасибо.",
    "ticket_price": 0,
    "image_url": "http://cabinet.clientomer.ru/storage/123004/advents/241.jpg",
    "date_start": "2025-09-30 21:00:00",
    "tickets_left": 10,
    "restaurant": {
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg"
    }
}];

export const mockEventsUsersList = [
    5753349682,
    217690245,
    291146366,
    940813721,
    1225265717,
    1145014952,
    5362638149,
    551243345,
    701368624,
    1090746420,
    596483540,
    1050003812,
    542527667,
    483425133,
    451194888,
    1020365281,
    7077186349,
    229667270,
    257329939,
    1094749437,
    201790418,
    79219030954,
    706889029,
    1357403642,
    475197315,
    586628247,
    244816672,
    353624620,
    115555014,
    153495524,
    1283802964,
    84327932,
    163811519,
    7160315434,
    118832541,
    189652327,
    5165491111,
    244983015
]
