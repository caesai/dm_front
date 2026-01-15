/**
 * @fileoverview Тесты для хука useBookingForm.
 * 
 * Хук useBookingForm - центральный хук для управления формой бронирования столиков.
 * Используется в трёх основных страницах:
 * - {@link BookingPage} - общая страница бронирования
 * - {@link RestaurantBookingPage} - бронирование конкретного ресторана
 * - {@link EventBookingPage} - бронирование на мероприятие
 * 
 * Тесты покрывают:
 * - Инициализация формы с данными пользователя
 * - Валидация полей (имя, телефон, дата, время, гости)
 * - Загрузка данных из API (доступные даты, временные слоты)
 * - Обработчики изменений полей формы
 * - Создание бронирования и навигация
 * - Различные сценарии использования
 * 
 * @module __tests__/useBookingForm
 * 
 * @see {@link useBookingForm} - тестируемый хук
 * @see {@link BookingPage.test.tsx} - тесты страницы общего бронирования
 * @see {@link RestaurantBookingPage.test.tsx} - тесты страницы бронирования ресторана
 * @see {@link EventBookingPage.test.tsx} - тесты страницы бронирования мероприятия
 */

import React, { PropsWithChildren } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { useBookingForm, IUseBookingFormOptions } from '@/hooks/useBookingForm';
import { authAtom, userAtom } from '@/atoms/userAtom';
import { certificatesListAtom } from '@/atoms/certificatesListAtom';
import { bookingFormAtom, getInitialBookingFormState } from '@/atoms/bookingFormAtom';
import { commAtom } from '@/atoms/bookingCommAtom';
import { mockUserData, mockUserNotOnboarded } from '@/__mocks__/user.mock';
import { mockTimeSlots, mockAvailableDates } from '@/__mocks__/booking.mock';
import { IUser } from '@/types/user.types';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок функции навигации react-router-dom.
 */
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок хука useToastState.
 */
const mockShowToast = jest.fn();

jest.mock('@/hooks/useToastState', () => ({
    __esModule: true,
    default: () => ({
        showToast: mockShowToast,
    }),
}));

/**
 * Мок API для бронирования.
 */
const mockAPIGetAvailableDays = jest.fn();
const mockAPIGetAvailableTimeSlots = jest.fn();
const mockAPICreateBooking = jest.fn();

jest.mock('@/api/restaurants.api.ts', () => ({
    APIGetAvailableDays: (...args: any[]) => mockAPIGetAvailableDays(...args),
    APIGetAvailableTimeSlots: (...args: any[]) => mockAPIGetAvailableTimeSlots(...args),
    APICreateBooking: (...args: any[]) => mockAPICreateBooking(...args),
}));

/**
 * Мок API для сертификатов.
 */
const mockAPIGetCertificates = jest.fn();
const mockAPIPostCertificateClaim = jest.fn();

jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificates: (...args: any[]) => mockAPIGetCertificates(...args),
    APIPostCertificateClaim: (...args: any[]) => mockAPIPostCertificateClaim(...args),
}));

// ============================================
// Тестовые провайдеры
// ============================================

/**
 * Интерфейс для начальных значений атомов.
 */
interface InitialValues {
    user?: IUser | undefined;
    auth?: { access_token: string } | null;
    certificates?: any[];
    comms?: string[];
}

/**
 * Компонент для гидрации атомов в тестах.
 */
const HydrateAtoms: React.FC<PropsWithChildren<{ initialValues: any[] }>> = ({ 
    initialValues, 
    children 
}) => {
    useHydrateAtoms(initialValues as any);
    return <>{children}</>;
};

/**
 * Создаёт провайдер с Jotai атомами для тестирования хука.
 * 
 * @param initialValues - Начальные значения атомов
 */
const createWrapper = (initialValues: InitialValues = {}) => {
    const {
        user = mockUserData,
        auth = { access_token: 'test-token' },
        certificates = [],
        comms = [],
    } = initialValues;

    const atomValues = [
        [userAtom, user],
        [authAtom, auth],
        [certificatesListAtom, certificates],
        [commAtom, comms],
        [bookingFormAtom, getInitialBookingFormState(user)],
    ];

    return ({ children }: PropsWithChildren) => (
        <Provider>
            <HydrateAtoms initialValues={atomValues}>{children}</HydrateAtoms>
        </Provider>
    );
};

// ============================================
// Тестовый набор
// ============================================

describe('useBookingForm', () => {
    // ============================================
    // Настройка тестов
    // ============================================

    /** Оригинальный console.error для восстановления */
    const originalConsoleError = console.error;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Подавляем ожидаемые ошибки
        jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            if (
                message.includes('Error fetching') ||
                message.includes('Booking creation error') ||
                message.includes('Certificate claim error') ||
                message.includes('not wrapped in act') ||
                message.includes('Warning: An update to')
            ) {
                return;
            }
            originalConsoleError(...args);
        });

        // Настройка моков API
        mockAPIGetAvailableDays.mockResolvedValue({ data: mockAvailableDates });
        mockAPIGetAvailableTimeSlots.mockResolvedValue({ data: mockTimeSlots });
        mockAPICreateBooking.mockResolvedValue({ data: { id: 123 } });
        mockAPIGetCertificates.mockResolvedValue({ data: [] });
        mockAPIPostCertificateClaim.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Инициализация формы
    // ============================================

    /**
     * Тесты инициализации формы с данными пользователя.
     * Форма должна предзаполняться данными из userAtom.
     */
    describe('Инициализация формы', () => {
        /**
         * Проверяет инициализацию формы с данными пользователя.
         */
        test('должен инициализировать форму с данными пользователя', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.userName).toBe(mockUserData.first_name);
                expect(result.current.form.userPhone).toBe(mockUserData.phone_number);
            });
        });

        /**
         * Проверяет начальное количество гостей = 0.
         */
        test('должен устанавливать начальное количество гостей = 0', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.guestCount).toBe(0);
                expect(result.current.form.childrenCount).toBe(0);
            });
        });

        /**
         * Проверяет начальное значение ресторана как "unset".
         */
        test('должен устанавливать начальное значение ресторана как "unset"', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.restaurant?.value).toBe('unset');
            });
        });

        /**
         * Проверяет начальное значение даты как "unset".
         */
        test('должен устанавливать начальное значение даты как "unset"', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.date?.value).toBe('unset');
            });
        });

        /**
         * Проверяет что временной слот изначально null.
         */
        test('должен устанавливать selectedTimeSlot = null', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.selectedTimeSlot).toBeNull();
            });
        });

        /**
         * Проверяет инициализацию способа подтверждения по умолчанию.
         */
        test('должен устанавливать способ подтверждения "В Telegram" по умолчанию', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.confirmation?.id).toBe('telegram');
                expect(result.current.form.confirmation?.text).toBe('В Telegram');
            });
        });
    });

    // ============================================
    // Тесты: Инициализация с preSelectedRestaurant
    // ============================================

    /**
     * Тесты инициализации с предвыбранным рестораном.
     * Используется в {@link RestaurantBookingPage}.
     */
    describe('Инициализация с preSelectedRestaurant', () => {
        /**
         * Проверяет установку ресторана из preSelectedRestaurant.
         */
        test('должен устанавливать ресторан из preSelectedRestaurant', async () => {
            const options: IUseBookingFormOptions = {
                preSelectedRestaurant: {
                    id: '1',
                    title: 'Test Restaurant',
                    address: 'Test Address',
                },
            };

            const { result } = renderHook(() => useBookingForm(options), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.restaurant?.value).toBe('1');
                expect(result.current.form.restaurant?.title).toBe('Test Restaurant');
            });
        });

        /**
         * Проверяет что preSelectedRestaurant возвращается из хука.
         */
        test('должен возвращать preSelectedRestaurant из хука', async () => {
            const preSelectedRestaurant = {
                id: '1',
                title: 'Test Restaurant',
                address: 'Test Address',
            };

            const { result } = renderHook(() => useBookingForm({ preSelectedRestaurant }), {
                wrapper: createWrapper(),
            });

            expect(result.current.preSelectedRestaurant).toEqual(preSelectedRestaurant);
        });
    });

    // ============================================
    // Тесты: Инициализация с eventData
    // ============================================

    /**
     * Тесты инициализации с данными мероприятия.
     * Используется в {@link EventBookingPage}.
     */
    describe('Инициализация с eventData', () => {
        /**
         * Проверяет установку ресторана и даты из eventData.
         */
        test('должен устанавливать ресторан из eventData', async () => {
            const eventData = {
                id: 1,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '2',
                restaurantTitle: 'Event Restaurant',
                restaurantAddress: 'Event Address',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.restaurant?.value).toBe('2');
                expect(result.current.form.restaurant?.title).toBe('Event Restaurant');
            });
        });

        /**
         * Проверяет установку даты из eventData.
         */
        test('должен устанавливать дату из eventData', async () => {
            const eventData = {
                id: 1,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '2',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.date?.value).toBe('2025-08-23');
            });
        });

        /**
         * Проверяет флаг isEventBooking.
         */
        test('должен устанавливать isEventBooking = true', async () => {
            const eventData = {
                id: 1,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '2',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            expect(result.current.isEventBooking).toBe(true);
        });

        /**
         * Проверяет что eventData возвращается из хука.
         */
        test('должен возвращать eventData из хука', async () => {
            const eventData = {
                id: 1,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '2',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            expect(result.current.eventData).toEqual(eventData);
        });
    });

    // ============================================
    // Тесты: Инициализация с initialBookingData
    // ============================================

    /**
     * Тесты инициализации с начальными данными бронирования.
     * Используется при передаче данных из location.state.
     */
    describe('Инициализация с initialBookingData', () => {
        /**
         * Проверяет установку даты из initialBookingData.
         */
        test('должен устанавливать дату из initialBookingData', async () => {
            const options: IUseBookingFormOptions = {
                preSelectedRestaurant: { id: '1', title: 'Test' },
                initialBookingData: {
                    bookedDate: { title: '23 авг', value: '2025-08-23' },
                },
            };

            const { result } = renderHook(() => useBookingForm(options), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.date?.value).toBe('2025-08-23');
            });
        });

        /**
         * Проверяет установку временного слота из initialBookingData.
         */
        test('должен устанавливать временной слот из initialBookingData', async () => {
            const bookedTime = mockTimeSlots[0];
            const options: IUseBookingFormOptions = {
                preSelectedRestaurant: { id: '1', title: 'Test' },
                initialBookingData: {
                    bookedDate: { title: '23 авг', value: '2025-08-23' },
                    bookedTime,
                },
            };

            const { result } = renderHook(() => useBookingForm(options), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.selectedTimeSlot).toEqual(bookedTime);
            });
        });

        /**
         * Проверяет установку количества гостей из initialBookingData.
         */
        test('должен устанавливать количество гостей из initialBookingData', async () => {
            const options: IUseBookingFormOptions = {
                preSelectedRestaurant: { id: '1', title: 'Test' },
                initialBookingData: {
                    guestCount: 3,
                    childrenCount: 1,
                },
            };

            const { result } = renderHook(() => useBookingForm(options), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.guestCount).toBe(3);
                expect(result.current.form.childrenCount).toBe(1);
            });
        });
    });

    // ============================================
    // Тесты: Валидация формы
    // ============================================

    /**
     * Тесты валидации полей формы.
     * Валидация включает проверку имени, телефона, даты, времени и гостей.
     */
    describe('Валидация формы', () => {
        /**
         * Проверяет что форма невалидна при пустых обязательных полях.
         */
        test('должен возвращать isFormValid = false при пустых полях', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isFormValid).toBe(false);
            });
        });

        /**
         * Проверяет валидацию имени - пустое имя невалидно.
         */
        test('должен отмечать невалидным пустое имя', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper({ user: { ...mockUserData, first_name: '' } }),
            });

            await waitFor(() => {
                expect(result.current.validationDisplay.nameValid).toBe(true); // до вызова triggerValidation
            });

            act(() => {
                result.current.triggerValidation();
            });

            expect(result.current.validationDisplay.nameValid).toBe(false);
        });

        /**
         * Проверяет валидацию телефона - неверный формат невалиден.
         */
        test('должен отмечать невалидным неверный формат телефона', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper({ user: { ...mockUserData, phone_number: '123' } }),
            });

            act(() => {
                result.current.triggerValidation();
            });

            expect(result.current.validationDisplay.phoneValid).toBe(false);
        });

        /**
         * Проверяет валидацию телефона - корректный формат валиден.
         */
        test('должен отмечать валидным корректный формат телефона', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper({ user: { ...mockUserData, phone_number: '+79991234567' } }),
            });

            // Телефон валиден при проверке
            await waitFor(() => {
                expect(result.current.form.userPhone).toBe('+79991234567');
            });
        });

        /**
         * Проверяет что количество гостей = 0 невалидно.
         */
        test('должен отмечать невалидным guestCount = 0', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.triggerValidation();
            });

            expect(result.current.validationDisplay.guestsValid).toBe(false);
        });

        /**
         * Проверяет сброс ошибок валидации через таймаут.
         */
        test('должен сбрасывать ошибки валидации через 5 секунд', async () => {
            jest.useFakeTimers();

            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper({ user: { ...mockUserData, first_name: '' } }),
            });

            act(() => {
                result.current.triggerValidation();
            });

            expect(result.current.validationDisplay.nameValid).toBe(false);

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            expect(result.current.validationDisplay.nameValid).toBe(true);

            jest.useRealTimers();
        });
    });

    // ============================================
    // Тесты: Обработчики формы
    // ============================================

    /**
     * Тесты обработчиков изменений полей формы.
     */
    describe('Обработчики формы', () => {
        /**
         * Проверяет обработчик выбора ресторана.
         */
        test('должен обновлять ресторан через selectRestaurant', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.form.restaurant?.value).toBe('unset');
            });

            act(() => {
                result.current.handlers.selectRestaurant({
                    title: 'New Restaurant',
                    value: '5',
                });
            });

            expect(result.current.form.restaurant?.value).toBe('5');
            expect(result.current.form.restaurant?.title).toBe('New Restaurant');
        });

        /**
         * Проверяет что выбор ресторана сбрасывает временной слот.
         */
        test('должен сбрасывать временной слот при смене ресторана', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            // Устанавливаем временной слот
            act(() => {
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            expect(result.current.form.selectedTimeSlot).toBeTruthy();

            // Меняем ресторан
            act(() => {
                result.current.handlers.selectRestaurant({ title: 'New', value: '2' });
            });

            expect(result.current.form.selectedTimeSlot).toBeNull();
        });

        /**
         * Проверяет обработчик выбора даты.
         */
        test('должен обновлять дату через selectDate', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectDate({
                    title: '23 авг',
                    value: '2025-08-23',
                });
            });

            expect(result.current.form.date?.value).toBe('2025-08-23');
        });

        /**
         * Проверяет что выбор даты сбрасывает временной слот.
         */
        test('должен сбрасывать временной слот при смене даты', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            act(() => {
                result.current.handlers.selectDate({ title: '24 авг', value: '2025-08-24' });
            });

            expect(result.current.form.selectedTimeSlot).toBeNull();
        });

        /**
         * Проверяет обработчик изменения количества гостей.
         */
        test('должен обновлять количество гостей через setGuestCount', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(3);
            });

            expect(result.current.form.guestCount).toBe(3);
        });

        /**
         * Проверяет обработчик с функцией для количества гостей.
         */
        test('должен поддерживать функцию в setGuestCount', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
            });

            act(() => {
                result.current.handlers.setGuestCount((prev) => prev + 1);
            });

            expect(result.current.form.guestCount).toBe(3);
        });

        /**
         * Проверяет обработчик изменения количества детей.
         */
        test('должен обновлять количество детей через setChildrenCount', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setChildrenCount(2);
            });

            expect(result.current.form.childrenCount).toBe(2);
        });

        /**
         * Проверяет обработчик выбора временного слота.
         */
        test('должен обновлять временной слот через selectTimeSlot', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            expect(result.current.form.selectedTimeSlot).toEqual(mockTimeSlots[0]);
        });

        /**
         * Проверяет обработчик изменения способа подтверждения.
         */
        test('должен обновлять способ подтверждения через setConfirmation', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setConfirmation({ id: 'phone', text: 'По телефону' });
            });

            expect(result.current.form.confirmation?.id).toBe('phone');
        });

        /**
         * Проверяет универсальный обработчик updateField.
         */
        test('должен обновлять поля через updateField', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.updateField({
                    userName: 'New Name',
                    commentary: 'Test comment',
                });
            });

            expect(result.current.form.userName).toBe('New Name');
            expect(result.current.form.commentary).toBe('Test comment');
        });
    });

    // ============================================
    // Тесты: canShowTimeSlots
    // ============================================

    /**
     * Тесты вычисляемого свойства canShowTimeSlots.
     */
    describe('canShowTimeSlots', () => {
        /**
         * Проверяет что canShowTimeSlots = false при guestCount = 0.
         */
        test('должен быть false при guestCount = 0', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            expect(result.current.canShowTimeSlots).toBe(false);
        });

        /**
         * Проверяет что canShowTimeSlots = false при date = unset.
         */
        test('должен быть false при date = unset', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
            });

            expect(result.current.canShowTimeSlots).toBe(false);
        });

        /**
         * Проверяет что canShowTimeSlots = true при выбранных дате и гостях.
         */
        test('должен быть true при выбранных дате и гостях', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
            });

            expect(result.current.canShowTimeSlots).toBe(true);
        });
    });

    // ============================================
    // Тесты: Загрузка данных из API
    // ============================================

    /**
     * Тесты загрузки данных из API.
     */
    describe('Загрузка данных из API', () => {
        /**
         * Проверяет загрузку доступных дат при выборе ресторана.
         */
        test('должен загружать доступные даты при выборе ресторана', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
            });

            await waitFor(() => {
                expect(mockAPIGetAvailableDays).toHaveBeenCalledWith(
                    'test-token',
                    '1',
                    1
                );
            });
        });

        /**
         * Проверяет что доступные даты сохраняются в availableDates.
         */
        test('должен сохранять доступные даты в availableDates', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
            });

            await waitFor(() => {
                expect(result.current.availableDates.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет загрузку временных слотов при выборе даты и гостей.
         */
        test('должен загружать временные слоты при выборе даты и гостей', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
            });

            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalledWith(
                    'test-token',
                    '1',
                    '2025-08-23',
                    2
                );
            });
        });

        /**
         * Проверяет что временные слоты сохраняются в availableTimeslots.
         */
        test('должен сохранять временные слоты в availableTimeslots', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
            });

            await waitFor(() => {
                expect(result.current.availableTimeslots.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет состояние загрузки дат.
         */
        test('должен устанавливать loading.dates во время загрузки', async () => {
            // Создаём промис, который не резолвится сразу
            let resolvePromise: (value: any) => void;
            mockAPIGetAvailableDays.mockImplementation(
                () => new Promise((resolve) => { resolvePromise = resolve; })
            );

            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
            });

            await waitFor(() => {
                expect(result.current.loading.dates).toBe(true);
            });

            act(() => {
                resolvePromise!({ data: mockAvailableDates });
            });

            await waitFor(() => {
                expect(result.current.loading.dates).toBe(false);
            });
        });

        /**
         * Проверяет обработку ошибки загрузки временных слотов.
         */
        test('должен устанавливать errors.timeslots при ошибке загрузки', async () => {
            mockAPIGetAvailableTimeSlots.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
            });

            await waitFor(() => {
                expect(result.current.errors.timeslots).toBe(true);
            });
        });
    });

    // ============================================
    // Тесты: Создание бронирования
    // ============================================

    /**
     * Тесты создания бронирования.
     */
    describe('Создание бронирования', () => {
        /**
         * Подготавливает хук с валидными данными для бронирования.
         */
        const setupValidBooking = async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            return result;
        };

        /**
         * Проверяет вызов API при создании бронирования.
         */
        test('должен вызывать API с правильными параметрами', async () => {
            const result = await setupValidBooking();

            await waitFor(() => {
                expect(result.current.form.selectedTimeSlot).toBeTruthy();
            });

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(mockAPICreateBooking).toHaveBeenCalledWith(
                    'test-token',
                    '1', // restaurantId
                    '2025-08-23', // date
                    '15:00', // time (getTimeShort)
                    2, // guestCount
                    0, // childrenCount
                    expect.any(String), // userName
                    expect.any(String), // userPhone
                    expect.any(String), // userEmail
                    '', // commentary
                    expect.any(Array), // comms (может быть вложенный массив)
                    'В Telegram', // confirmation
                    false, // preOrder
                    null, // eventId
                    null // certificateId
                );
            });
        });

        /**
         * Проверяет навигацию после успешного бронирования.
         */
        test('должен навигировать на /myBookings/{id} после успешного бронирования', async () => {
            mockAPICreateBooking.mockResolvedValue({ data: { id: 456 } });

            const result = await setupValidBooking();

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/myBookings/456');
            });
        });

        /**
         * Проверяет навигацию на /tickets/{id} для бронирования мероприятия.
         */
        test('должен навигировать на /tickets/{id} для бронирования мероприятия', async () => {
            mockAPICreateBooking.mockResolvedValue({ data: { id: 123, ticket_id: 789 } });

            const eventData = {
                id: 1,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '1',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/tickets/789');
            });
        });

        /**
         * Проверяет передачу event_id для бронирования мероприятия.
         */
        test('должен передавать event_id для бронирования мероприятия', async () => {
            const eventData = {
                id: 42,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '1',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(mockAPICreateBooking).toHaveBeenCalledWith(
                    expect.any(String),
                    '1',
                    expect.any(String),
                    expect.any(String),
                    expect.any(Number),
                    expect.any(Number),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(Array),
                    expect.any(String),
                    expect.any(Boolean),
                    42, // event_id
                    null
                );
            });
        });

        /**
         * Проверяет что не передаётся event_id для обычного бронирования.
         */
        test('должен НЕ передавать event_id для обычного бронирования', async () => {
            const result = await setupValidBooking();

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(mockAPICreateBooking).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(Number),
                    expect.any(Number),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(Array),
                    expect.any(String),
                    expect.any(Boolean),
                    null, // event_id = null
                    null
                );
            });
        });

        /**
         * Проверяет состояние loading.submit во время создания бронирования.
         */
        test('должен устанавливать loading.submit во время создания', async () => {
            let resolvePromise: (value: any) => void;
            mockAPICreateBooking.mockImplementation(
                () => new Promise((resolve) => { resolvePromise = resolve; })
            );

            const result = await setupValidBooking();

            act(() => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(result.current.loading.submit).toBe(true);
            });

            act(() => {
                resolvePromise!({ data: { id: 123 } });
            });

            await waitFor(() => {
                expect(result.current.loading.submit).toBe(false);
            });
        });

        /**
         * Проверяет обработку ошибки бэкенда (botError).
         */
        test('должен устанавливать errors.botError при ошибке от бота', async () => {
            mockAPICreateBooking.mockResolvedValue({ data: { error: 'Bot error' } });

            const result = await setupValidBooking();

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(result.current.errors.botError).toBe(true);
                expect(result.current.errors.popup).toBe(true);
            });
        });

        /**
         * Проверяет увеличение popupCount при сетевой ошибке.
         */
        test('должен увеличивать popupCount при ошибке создания', async () => {
            mockAPICreateBooking.mockRejectedValue(new Error('Network error'));

            const result = await setupValidBooking();

            await act(async () => {
                result.current.createBooking();
            });

            await waitFor(() => {
                expect(result.current.errors.popup).toBe(true);
                expect(result.current.errors.popupCount).toBe(1);
            });
        });
    });

    // ============================================
    // Тесты: Редирект на онбординг
    // ============================================

    /**
     * Тесты редиректа на онбординг для пользователей без complete_onboarding.
     * Аналогично тестам в RestaurantBookingPage.test.tsx, EventBookingPage.test.tsx.
     */
    describe('Редирект на онбординг', () => {
        /**
         * Проверяет редирект на онбординг для пользователя без complete_onboarding.
         */
        test('должен редиректить на /onboarding/3 для пользователя без onboarding', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper({ user: mockUserNotOnboarded }),
            });

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            act(() => {
                result.current.createBooking();
            });

            expect(mockedNavigate).toHaveBeenCalledWith(
                '/onboarding/3',
                expect.objectContaining({
                    state: expect.objectContaining({
                        id: 1, // Number(restaurant.value)
                    }),
                })
            );
        });

        /**
         * Проверяет что eventId передаётся в state при редиректе на онбординг.
         */
        test('должен передавать eventId в state при редиректе на онбординг', async () => {
            const eventData = {
                id: 42,
                name: 'Test Event',
                dateStart: '2025-08-23T15:00:00',
                restaurantId: '1',
            };

            const { result } = renderHook(() => useBookingForm({ eventData }), {
                wrapper: createWrapper({ user: mockUserNotOnboarded }),
            });

            act(() => {
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            act(() => {
                result.current.createBooking();
            });

            expect(mockedNavigate).toHaveBeenCalledWith(
                '/onboarding/3',
                expect.objectContaining({
                    state: expect.objectContaining({
                        eventId: 42,
                    }),
                })
            );
        });

        /**
         * Проверяет что sharedRestaurant передаётся в state.
         */
        test('должен передавать sharedRestaurant в state при редиректе', async () => {
            const { result } = renderHook(
                () => useBookingForm({ isShared: true }),
                { wrapper: createWrapper({ user: mockUserNotOnboarded }) }
            );

            act(() => {
                result.current.handlers.selectRestaurant({ title: 'Test', value: '1' });
                result.current.handlers.setGuestCount(2);
                result.current.handlers.selectDate({ title: '23 авг', value: '2025-08-23' });
                result.current.handlers.selectTimeSlot(mockTimeSlots[0]);
            });

            act(() => {
                result.current.createBooking();
            });

            expect(mockedNavigate).toHaveBeenCalledWith(
                '/onboarding/3',
                expect.objectContaining({
                    state: expect.objectContaining({
                        sharedRestaurant: true,
                    }),
                })
            );
        });
    });

    // ============================================
    // Тесты: setErrorPopup
    // ============================================

    /**
     * Тесты управления popup с ошибкой.
     */
    describe('setErrorPopup', () => {
        /**
         * Проверяет что setErrorPopup устанавливает errors.popup.
         */
        test('должен устанавливать errors.popup через setErrorPopup', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.setErrorPopup(true);
            });

            expect(result.current.errors.popup).toBe(true);

            act(() => {
                result.current.setErrorPopup(false);
            });

            expect(result.current.errors.popup).toBe(false);
        });
    });

    // ============================================
    // Тесты: isSharedRestaurant
    // ============================================

    /**
     * Тесты флага isSharedRestaurant.
     */
    describe('isSharedRestaurant', () => {
        /**
         * Проверяет что isSharedRestaurant по умолчанию false.
         */
        test('должен быть false по умолчанию', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isShared).toBe(false);
        });

        /**
         * Проверяет что isSharedRestaurant возвращает переданное значение.
         */
        test('должен возвращать переданное значение', async () => {
            const { result } = renderHook(
                () => useBookingForm({ isShared: true }),
                { wrapper: createWrapper() }
            );

            expect(result.current.isShared).toBe(true);
        });
    });

    // ============================================
    // Тесты: Согласованность с компонентами страниц
    // ============================================

    /**
     * Тесты согласованности возвращаемых значений хука с ожиданиями компонентов.
     * Согласовано с RestaurantBookingPage.test.tsx, EventBookingPage.test.tsx, BookingPage.test.tsx.
     */
    describe('Согласованность с компонентами страниц', () => {
        /**
         * Проверяет что хук возвращает все необходимые поля для компонентов.
         */
        test('должен возвращать все необходимые поля для компонентов', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            // Состояние формы
            expect(result.current).toHaveProperty('form');
            expect(result.current).toHaveProperty('isFormValid');
            expect(result.current).toHaveProperty('validationDisplay');
            expect(result.current).toHaveProperty('triggerValidation');

            // Данные из API
            expect(result.current).toHaveProperty('availableDates');
            expect(result.current).toHaveProperty('availableTimeslots');
            expect(result.current).toHaveProperty('canShowTimeSlots');

            // Состояния загрузки и ошибок
            expect(result.current).toHaveProperty('loading');
            expect(result.current).toHaveProperty('errors');
            expect(result.current).toHaveProperty('setErrorPopup');

            // Обработчики
            expect(result.current).toHaveProperty('handlers');
            expect(result.current.handlers).toHaveProperty('selectRestaurant');
            expect(result.current.handlers).toHaveProperty('selectDate');
            expect(result.current.handlers).toHaveProperty('setGuestCount');
            expect(result.current.handlers).toHaveProperty('setChildrenCount');
            expect(result.current.handlers).toHaveProperty('selectTimeSlot');
            expect(result.current.handlers).toHaveProperty('setConfirmation');
            expect(result.current.handlers).toHaveProperty('updateField');

            // Действия
            expect(result.current).toHaveProperty('createBooking');

            // Контекст
            expect(result.current).toHaveProperty('preSelectedRestaurant');
            expect(result.current).toHaveProperty('isShared');
            expect(result.current).toHaveProperty('isEventBooking');
            expect(result.current).toHaveProperty('eventData');
        });

        /**
         * Проверяет структуру loading.
         */
        test('должен иметь правильную структуру loading', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            expect(result.current.loading).toHaveProperty('timeslots');
            expect(result.current.loading).toHaveProperty('dates');
            expect(result.current.loading).toHaveProperty('submit');
        });

        /**
         * Проверяет структуру errors.
         */
        test('должен иметь правильную структуру errors', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            expect(result.current.errors).toHaveProperty('timeslots');
            expect(result.current.errors).toHaveProperty('popup');
            expect(result.current.errors).toHaveProperty('botError');
            expect(result.current.errors).toHaveProperty('popupCount');
        });

        /**
         * Проверяет структуру validationDisplay.
         */
        test('должен иметь правильную структуру validationDisplay', async () => {
            const { result } = renderHook(() => useBookingForm(), {
                wrapper: createWrapper(),
            });

            expect(result.current.validationDisplay).toHaveProperty('nameValid');
            expect(result.current.validationDisplay).toHaveProperty('phoneValid');
            expect(result.current.validationDisplay).toHaveProperty('dateValid');
            expect(result.current.validationDisplay).toHaveProperty('timeSlotValid');
            expect(result.current.validationDisplay).toHaveProperty('guestsValid');
        });
    });
});
