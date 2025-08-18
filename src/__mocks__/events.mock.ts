import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';

export const mockEventsList: IEvent[] = [{
    "name": "Дегустация чая",
    "description": "Никогда не пили чай?\r\nТогда приходите к нам на дегустацию. Если вы пили чай раньше, вы можете тоже принять участие в мероприятии, так как чай можно пить каждый день.\r\n🍇🍈🍊🍋🍎\r\nЧай - это высушенные и особо обработанные листья некоторых культивируемых вечнозелёных растений, на которых настаивается горячий напиток.",
    "ticket_price": 5,
    "image_url": "",
    "restaurants": [{
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg",
        "dates": [{
            "id": 122,
            "date_start": "2025-08-25 18:00:00",
            "date_end": "2025-08-25 18:00:00",
            "ticket_price": 5,
            "tickets_left": 4
        }]
    }]
}, {
    "name": "Вечер шеф повара",
    "description": "тестовое мероприятие",
    "ticket_price": 3000,
    "image_url": "",
    "restaurants": [{
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg",
        "dates": [{
            "id": 168,
            "date_start": "2025-10-31 12:00:00",
            "date_end": "2025-10-31 12:00:00",
            "ticket_price": 3000,
            "tickets_left": 4
        }]
    }]
}, {
    "name": "Японский вечер",
    "description": "Японский вечер — атмосферное погружение в культуру Страны восходящего солнца. Вас ждут изысканные блюда японской кухни, живая музыка и уютная атмосфера.",
    "ticket_price": 1500,
    "image_url": "http://cabinet.clientomer.ru/storage/123004/advents/169.jpg",
    "restaurants": [{
        "id": 4,
        "title": "Self Edge Japanese",
        "address": "Санкт-Петербург, ул. Радищева, 34",
        "thumbnail_photo": "https://storage.yandexcloud.net/bottec-dreamteam/SEJ/main.jpg",
        "dates": [{
            "id": 169,
            "date_start": "2025-08-23 15:00:00",
            "date_end": "2025-08-23 15:00:00",
            "ticket_price": 1500,
            "tickets_left": 25
        }]
    }]
}];
