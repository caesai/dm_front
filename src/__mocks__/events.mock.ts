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
    }
}];
