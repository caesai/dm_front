/**
 * Моки для тестирования страниц бронирования.
 * 
 * @module __mocks__/booking.mock
 * @see {@link useBookingForm} - хук, использующий эти моки
 * @see {@link BookingPage.test.tsx} - тесты страницы бронирования
 * @see {@link RestaurantBookingPage.test.tsx} - тесты бронирования ресторана
 * @see {@link EventBookingPage.test.tsx} - тесты бронирования мероприятия
 */

import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types';

/**
 * Моковые временные слоты для бронирования.
 * Соответствуют интерфейсу ITimeSlot.
 */
export const mockTimeSlots: ITimeSlot[] = [
    { start_datetime: '2025-08-23 15:00:00', end_datetime: '2025-08-23 15:30:00', is_free: true },
    { start_datetime: '2025-08-23 15:30:00', end_datetime: '2025-08-23 16:00:00', is_free: true },
    { start_datetime: '2025-08-23 16:00:00', end_datetime: '2025-08-23 16:30:00', is_free: true },
];

/**
 * Моковые доступные даты для бронирования.
 */
export const mockAvailableDates = ['2025-08-23', '2025-08-24', '2025-08-25'];
