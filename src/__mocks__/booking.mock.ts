/**
 * Моки для тестирования страниц бронирования.
 *
 * @module __mocks__/booking.mock
 * @see {@link useBookingForm} - хук, использующий эти моки
 * @see {@link BookingPage.test.tsx} - тесты страницы бронирования
 * @see {@link RestaurantBookingPage.test.tsx} - тесты бронирования ресторана
 * @see {@link EventBookingPage.test.tsx} - тесты бронирования мероприятия
 * @see {@link BookingInfoPage.test.tsx} - тесты страницы информации о бронировании
 */

import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types';
import { IAvailableDay, IBookingInfo } from '@/types/restaurant.types';

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
 * Моковые доступные даты для бронирования (без депозита).
 * Формат: строки дат.
 * @deprecated Используйте mockAvailableDaysAPI для новых тестов
 */
export const mockAvailableDates = ['2025-08-23', '2025-08-24', '2025-08-25'];

/**
 * Моковые доступные даты с полной структурой IAvailableDay.
 * Включает обычные даты и даты с депозитом.
 */
export const mockAvailableDaysAPI: IAvailableDay[] = [
    { date: '2025-08-23', attributes: [], deposit_per_person: 0 },
    { date: '2025-08-24', attributes: ['requires_deposit'], deposit_per_person: 1500 },
    { date: '2025-08-25', attributes: [], deposit_per_person: 0 },
    { date: '2025-08-26', attributes: ['requires_deposit'], deposit_per_person: 2000 },
];

/**
 * Моковая дата без депозита.
 */
export const mockNonDepositDate: IAvailableDay = {
    date: '2025-08-23',
    attributes: [],
    deposit_per_person: 0,
};

/**
 * Моковая дата с депозитом.
 */
export const mockDepositDate: IAvailableDay = {
    date: '2025-08-24',
    attributes: ['requires_deposit'],
    deposit_per_person: 1500,
};

/**
 * Моковое бронирование без депозита.
 */
export const mockBookingInfo: IBookingInfo = {
    id: '123',
    restaurant: {
        id: '1',
        title: 'Test Restaurant',
        address: 'Test Address',
        thumbnail_photo: 'https://example.com/photo.jpg',
    },
    booking_date: '2025-08-23',
    time: '15:00',
    guests_count: 2,
    children_count: 0,
    booking_status: 'confirmed',
    user_comments: '',
    tags: '',
    duration: 120,
    certificate_value: 0,
    certificate_expired_at: '',
    features: [],
    attributes: [],
};

/**
 * Моковое бронирование с депозитом.
 */
export const mockDepositBookingInfo: IBookingInfo = {
    ...mockBookingInfo,
    id: '456',
    booking_date: '2025-08-24',
    attributes: ['requires_deposit'],
};

/**
 * Моковое бронирование в статусе ожидания.
 */
export const mockWaitingBookingInfo: IBookingInfo = {
    ...mockBookingInfo,
    id: '789',
    booking_status: 'waiting',
};

/**
 * Моковое отменённое бронирование.
 */
export const mockCanceledBookingInfo: IBookingInfo = {
    ...mockBookingInfo,
    id: '101',
    booking_status: 'canceled',
};
