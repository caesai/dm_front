import { IEvent } from '@/types/events.types.ts';

/**
 * Список мероприятий для тестов.
 */
export const mockEventsList: IEvent[] = [
    {
        id: Number(122),
        name: 'Дегустация чая',
        description:
            'Никогда не пили чай?\r\nТогда приходите к нам на дегустацию. Если вы пили чай раньше, вы можете тоже принять участие в мероприятии, так как чай можно пить каждый день.\r\n🍇🍈🍊🍋🍎\r\nЧай - это высушенные и особо обработанные листья некоторых культивируемых вечнозелёных растений, на которых настаивается горячий напиток.',
        ticket_price: 0,
        image_url: '',
        date_start: '2025-08-23 15:00:00',
        tickets_left: 24,
        restaurant: {
            id: String(4),
            title: 'Self Edge Japanese',
            address: 'Санкт-Петербург, ул. Радищева, 34',
            address_lonlng: '',
            thumbnail_photo: 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg',
        },
        date_end: '',
    },
    {
        id: Number(168),
        name: 'Вечер шеф повара',
        description: 'тестовое мероприятие',
        ticket_price: 3000,
        image_url: '',
        date_start: '2025-08-23 15:00:00',
        tickets_left: 24,
        restaurant: {
            id: String(4),
            title: 'Self Edge Japanese',
            address: 'Санкт-Петербург, ул. Радищева, 34',
            address_lonlng: '',
            thumbnail_photo: 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg',
        },
        date_end: '',
    },
    {
        id: Number(169),
        name: 'Японский вечер',
        description:
            'Японский вечер — атмосферное погружение в культуру Страны восходящего солнца. Вас ждут изысканные блюда японской кухни, живая музыка и уютная атмосфера.',
        ticket_price: 1500,
        image_url: 'http://cabinet.clientomer.ru/storage/123004/advents/169.jpg',
        date_start: '2025-08-23 15:00:00',
        tickets_left: 24,
        restaurant: {
            id: String(4),
            title: 'Self Edge Japanese',
            address: 'Санкт-Петербург, ул. Радищева, 34',
            address_lonlng: '',
            thumbnail_photo: 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg',
        },
        date_end: '',
    },
    {
        id: Number(241),
        name: '🍨 Встреча любителей высокой кухни',
        description:
            'Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие.\r\nБесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Бесплатное тестовое мероприятие. Спасибо.',
        ticket_price: 0,
        image_url: 'http://cabinet.clientomer.ru/storage/123004/advents/241.jpg',
        date_start: '2025-09-30 21:00:00',
        tickets_left: 10,
        restaurant: {
            id: String(4),
            title: 'Self Edge Japanese',
            address: 'Санкт-Петербург, ул. Радищева, 34',
            address_lonlng: '',
            thumbnail_photo: 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg',
        },
        date_end: '',
    },
];

/**
 * Список мероприятий с заполненными image_url.
 * Без image_url карточки могут отображаться некорректно.
 */
export const mockEventsWithImages: IEvent[] = mockEventsList.map((e) => ({
    ...e,
    image_url: e.image_url || 'https://example.com/default-event-image.jpg',
}));

/**
 * Бесплатное мероприятие для тестов.
 */
export const freeEvent: IEvent = {
    ...mockEventsList[0],
    ticket_price: 0,
};

/**
 * Платное мероприятие для тестов.
 */
export const paidEvent: IEvent = {
    ...mockEventsList[1],
    ticket_price: 3000,
};
