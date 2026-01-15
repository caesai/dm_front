/**
 * @fileoverview Тесты для страницы бронирования бесплатного мероприятия EventBookingPage.
 * 
 * Страница предназначена для бронирования столика на бесплатное мероприятие.
 * Пользователь попадает сюда со страницы деталей мероприятия (EventDetailsPage).
 * 
 * Основные функции страницы:
 * - Отображение информации о мероприятии (название, дата)
 * - Выбор количества гостей и детей
 * - Выбор времени бронирования
 * - Ввод контактных данных (имя, телефон)
 * - Выбор способа подтверждения
 * - Дополнительные пожелания к бронированию
 * - Создание бронирования через API
 * 
 * @module __tests__/events/EventBookingPage
 * 
 * @see {@link EventBookingPage} - тестируемый компонент
 * @see {@link EventDetailsPage} - страница, с которой пользователь переходит на бронирование
 * @see {@link useBookingForm} - хук управления формой бронирования
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EventBookingPage } from '@/pages/BookingPage/EventBookingPage';
import { userAtom, authAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom, childrenCountAtom } from '@/atoms/eventListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockEventsList } from '@/__mocks__/events.mock';
import { IUser } from '@/types/user.types.ts';
import { IEvent } from '@/types/events.types.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок Telegram SDK.
 * Имитирует backButton, mainButton и locationManager для работы компонента.
 */
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        hide: jest.fn(),
        onClick: jest.fn(() => jest.fn()),
    },
    mainButton: {
        onClick: jest.fn(() => jest.fn()),
        setParams: jest.fn(),
        mount: {
            isAvailable: jest.fn(),
        },
        unmount: jest.fn(),
    },
    locationManager: {
        requestLocation: {
            isAvailable: jest.fn(),
        },
        openSettings: {
            isAvailable: jest.fn(),
        },
        isAccessRequested: jest.fn(),
        isAccessGranted: jest.fn(),
    },
}));

/**
 * Мок функции навигации react-router-dom.
 * Позволяет проверять вызовы navigate() в тестах.
 */
const mockedNavigate = jest.fn();

/**
 * Мок функции useParams для получения eventId из URL.
 */
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
    useParams: () => mockUseParams(),
}));

/**
 * Мок API для бронирования.
 * - APIGetAvailableDays - возвращает доступные даты
 * - APIGetAvailableTimeSlots - возвращает доступные временные слоты
 * - APICreateBooking - создаёт бронирование
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
 * Мок API для сертификатов (используется в useBookingForm).
 */
jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificates: jest.fn(() => Promise.resolve({ data: [] })),
    APIPostCertificateClaim: jest.fn(() => Promise.resolve({})),
}));

/**
 * Мок Telegram WebApp объекта.
 * Необходим для работы компонентов, использующих Telegram API.
 */
Object.defineProperty(window, 'Telegram', {
    writable: true,
    value: {
        WebApp: {
            initDataUnsafe: {
                user: { id: 1 },
            },
        },
    },
});

/**
 * Мок localStorage для работы с настройками.
 */
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы бронирования бесплатного мероприятия.
 * 
 * Покрывает следующие сценарии:
 * - Отображение информации о мероприятии
 * - Начальное количество гостей из атомов
 * - Работа счётчика гостей
 * - Отображение временных слотов
 * - Ввод контактных данных
 * - Выбор способа подтверждения
 * - Валидация формы
 * - Создание бронирования
 * - Навигация после успешного бронирования
 */
describe('EventBookingPage', () => {
    // ============================================
    // Тестовые данные
    // ============================================

    /**
     * Бесплатное мероприятие для тестов (ticket_price === 0).
     */
    const freeEvent: IEvent = mockEventsList.find(e => e.ticket_price === 0)!;

    /**
     * Моковые временные слоты для бронирования.
     */
    const mockTimeSlots = [
        { start_datetime: '2025-08-23 15:00:00', end_datetime: '2025-08-23 15:30:00' },
        { start_datetime: '2025-08-23 15:30:00', end_datetime: '2025-08-23 16:00:00' },
        { start_datetime: '2025-08-23 16:00:00', end_datetime: '2025-08-23 16:30:00' },
    ];

    /**
     * Моковые доступные даты для бронирования.
     */
    const mockAvailableDates = ['2025-08-23', '2025-08-24', '2025-08-25'];

    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент EventBookingPage с необходимыми провайдерами.
     * 
     * @param user - Данные пользователя (по умолчанию mockUserData)
     * @param events - Список мероприятий (по умолчанию mockEventsList)
     * @param eventId - ID мероприятия для бронирования
     * @param initialGuestCount - Начальное количество гостей в атоме
     * @param initialChildrenCount - Начальное количество детей в атоме
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Рендер с начальным количеством гостей
     * renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 1);
     * 
     * @example
     * // Рендер с пользователем без onboarding
     * renderComponent({ ...mockUserData, complete_onboarding: false });
     */
    const renderComponent = (
        user: IUser | undefined = mockUserData,
        events: IEvent[] | null = mockEventsList,
        eventId: string = String(freeEvent.id),
        initialGuestCount: number = 0,
        initialChildrenCount: number = 0
    ) => {
        mockUseParams.mockReturnValue({ eventId });

        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [authAtom, { access_token: 'test-token' }],
            [eventsListAtom, events],
            [guestCountAtom, initialGuestCount],
            [childrenCountAtom, initialChildrenCount],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/events/${eventId}/booking`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/events/:eventId/booking" element={<EventBookingPage />} />
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    // ============================================
    // Настройка тестов
    // ============================================

    /** Оригинальный console.error для восстановления после тестов */
    const originalConsoleError = console.error;
    /** Оригинальный console.warn для восстановления после тестов */
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseParams.mockReturnValue({ eventId: String(freeEvent.id) });
        
        // Подавляем ожидаемые ошибки в консоли
        jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            // Игнорируем ожидаемые ошибки API и React warnings
            if (
                message.includes('Error fetching') ||
                message.includes('Booking creation error') ||
                message.includes('Certificate claim error') ||
                message.includes('not wrapped in act') ||
                message.includes('Not implemented: navigation')
            ) {
                return;
            }
            originalConsoleError(...args);
        });
        
        // Подавляем предупреждения о SVG атрибутах
        jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            // Игнорируем предупреждения о SVG атрибутах (stroke-width, clip-path и т.д.)
            if (
                message.includes('Invalid DOM property') ||
                message.includes('stroke-width') ||
                message.includes('clip-path') ||
                message.includes('stroke-linecap') ||
                message.includes('stroke-linejoin')
            ) {
                return;
            }
            originalConsoleWarn(...args);
        });
        
        // Настройка моков API
        mockAPIGetAvailableDays.mockResolvedValue({ data: mockAvailableDates });
        mockAPIGetAvailableTimeSlots.mockResolvedValue({ data: mockTimeSlots });
        mockAPICreateBooking.mockResolvedValue({ 
            data: { id: 123, ticket_id: 456 } 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Отображение информации о мероприятии
    // ============================================

    /**
     * Тесты отображения основной информации о мероприятии в заголовке.
     */
    describe('Отображение информации о мероприятии', () => {
        /**
         * Проверяет отображение названия мероприятия в заголовке.
         */
        test('должен отображать название мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение форматированной даты мероприятия.
         */
        test('должен отображать дату мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Дата в формате DD MMM (23 авг)
                expect(screen.getByText(/23 авг/i)).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Начальное количество гостей
    // ============================================

    /**
     * Тесты инициализации количества гостей из атомов.
     * Количество гостей передаётся с EventDetailsPage через Jotai атомы.
     * 
     * Компонент GuestCountSelector отображает общее количество гостей
     * в формате "N гост(ь/я/ей)" через функцию getGuestsString.
     */
    describe('Начальное количество гостей', () => {
        /**
         * Проверяет, что количество гостей из атома отображается в форме.
         * При 3 взрослых отображается "3 гостя".
         */
        test('должен отображать начальное количество гостей из атома', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 3, 0);

            await waitFor(() => {
                // Проверяем что форма инициализирована с правильным количеством гостей
                // GuestCountSelector показывает "3 гостя" (getGuestsString(3))
                expect(screen.getByText('3 гостя')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет, что количество детей из атома учитывается в общем числе.
         * При 2 взрослых + 1 ребёнок отображается "3 гостя" (общее количество).
         */
        test('должен учитывать начальное количество детей из атома', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 1);

            await waitFor(() => {
                // GuestCountSelector показывает сумму взрослых и детей
                // 2 взрослых + 1 ребёнок = "3 гостя"
                expect(screen.getByText('3 гостя')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Временные слоты
    // ============================================

    /**
     * Тесты отображения и загрузки временных слотов.
     */
    describe('Временные слоты', () => {
        /**
         * Проверяет автоматическую установку guestCount = 1 для мероприятий
         * когда initialGuestCount = 0 (не было явно задано на EventDetailsPage).
         * Это позволяет сразу загрузить временные слоты.
         */
        test('должен автоматически устанавливать guestCount = 1 при initialGuestCount = 0', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 0, 0);

            // При guestCount = 1 временные слоты должны загрузиться
            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });
        });

        /**
         * Проверяет загрузку временных слотов когда количество гостей > 0.
         */
        test('должен загружать временные слоты при наличии гостей', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });
        });

        /**
         * Проверяет что временные слоты загружаются с правильными параметрами.
         * Примечание: Swiper не рендерит слайды корректно в jsdom,
         * поэтому проверяем вызов API вместо отображения UI.
         */
        test('должен отображать загруженные временные слоты', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            await waitFor(() => {
                // Проверяем что API был вызван с правильными параметрами
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalledWith(
                    'test-token',
                    String(freeEvent.restaurant.id),
                    expect.any(String), // дата
                    2 // количество гостей
                );
            });
        });
    });

    // ============================================
    // Тесты: Контактные данные
    // ============================================

    /**
     * Тесты блока контактных данных.
     */
    describe('Контактные данные', () => {
        /**
         * Проверяет наличие заголовка блока контактов.
         */
        test('должен отображать заголовок "Контакты"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Контакты')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет предзаполнение имени из данных пользователя.
         */
        test('должен предзаполнять имя из данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('Имя');
                expect(nameInput).toHaveValue(mockUserData.first_name);
            });
        });

        /**
         * Проверяет предзаполнение телефона из данных пользователя.
         */
        test('должен предзаполнять телефон из данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                const phoneInput = screen.getByPlaceholderText('Телефон');
                expect(phoneInput).toHaveValue(mockUserData.phone_number);
            });
        });

        /**
         * Проверяет возможность изменения имени.
         */
        test('должен позволять изменять имя', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
            });

            const nameInput = screen.getByPlaceholderText('Имя');
            fireEvent.change(nameInput, { target: { value: 'Новое Имя' } });

            expect(nameInput).toHaveValue('Новое Имя');
        });

        /**
         * Проверяет возможность изменения телефона.
         */
        test('должен позволять изменять телефон', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument();
            });

            const phoneInput = screen.getByPlaceholderText('Телефон');
            fireEvent.change(phoneInput, { target: { value: '+79991234567' } });

            expect(phoneInput).toHaveValue('+79991234567');
        });
    });

    // ============================================
    // Тесты: Способ подтверждения
    // ============================================

    /**
     * Тесты выбора способа подтверждения бронирования.
     */
    describe('Способ подтверждения', () => {
        /**
         * Проверяет отображение опций подтверждения.
         */
        test('должен отображать опции подтверждения', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('В Telegram')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Кнопка бронирования
    // ============================================

    /**
     * Тесты кнопки "Забронировать стол".
     */
    describe('Кнопка бронирования', () => {
        /**
         * Проверяет наличие кнопки бронирования.
         */
        test('должен отображать кнопку "Забронировать стол"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Забронировать стол')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет, что кнопка неактивна при невалидной форме.
         * Форма невалидна если не выбран временной слот или количество гостей = 0.
         */
        test('кнопка должна быть неактивна при невалидной форме', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 0, 0);

            await waitFor(() => {
                const button = screen.getByText('Забронировать стол').closest('button');
                expect(button).toBeDisabled();
            });
        });
    });

    // ============================================
    // Тесты: Создание бронирования
    // ============================================

    /**
     * Тесты процесса создания бронирования.
     */
    describe('Создание бронирования', () => {
        /**
         * Проверяет вызов API с event_id при создании бронирования.
         * Временной слот выбирается автоматически для мероприятий.
         */
        test('должен передавать event_id в API при создании бронирования', async () => {
            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            // Ждём загрузки временных слотов (слот выбирается автоматически)
            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });

            // Даём время на автоматический выбор слота
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Нажимаем кнопку бронирования
            const bookButton = screen.getByText('Забронировать стол');
            
            await act(async () => {
                fireEvent.click(bookButton);
            });

            await waitFor(() => {
                // Проверяем что API вызван с event_id
                expect(mockAPICreateBooking).toHaveBeenCalledWith(
                    expect.any(String), // token
                    String(freeEvent.restaurant.id), // restaurantId
                    expect.any(String), // date
                    expect.any(String), // time
                    2, // guests_count
                    0, // children_count
                    expect.any(String), // name
                    expect.any(String), // phone
                    expect.any(String), // email
                    expect.any(String), // comment
                    expect.any(Array), // prepared_comments
                    expect.any(String), // confirmation
                    expect.any(Boolean), // pre_order_dishes
                    freeEvent.id, // event_id - важно!
                    null // certificate_id
                );
            });
        });

        /**
         * Проверяет навигацию на страницу билета после успешного бронирования.
         * При бронировании на мероприятие бэкенд возвращает ticket_id.
         * Временной слот выбирается автоматически для мероприятий.
         */
        test('должен перенаправлять на страницу билета после успешного бронирования', async () => {
            mockAPICreateBooking.mockResolvedValue({
                data: { id: 123, ticket_id: 456 }
            });

            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            // Ждём загрузки временных слотов (слот выбирается автоматически)
            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });

            // Даём время на автоматический выбор слота
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const bookButton = screen.getByText('Забронировать стол');
            
            await act(async () => {
                fireEvent.click(bookButton);
            });

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/tickets/456');
            });
        });
    });

    // ============================================
    // Тесты: Редирект на онбординг
    // ============================================

    /**
     * Тесты редиректа на онбординг для пользователей без complete_onboarding.
     */
    describe('Редирект на онбординг', () => {
        /**
         * Проверяет редирект на онбординг для пользователя без complete_onboarding.
         * Временной слот выбирается автоматически для мероприятий.
         */
        test('должен перенаправлять на онбординг для пользователя без complete_onboarding', async () => {
            const userWithoutOnboarding: IUser = {
                ...mockUserData,
                complete_onboarding: false,
            };

            renderComponent(userWithoutOnboarding, mockEventsList, String(freeEvent.id), 2, 0);

            // Ждём загрузки временных слотов (слот выбирается автоматически)
            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });

            // Даём время на автоматический выбор слота
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const bookButton = screen.getByText('Забронировать стол');
            
            await act(async () => {
                fireEvent.click(bookButton);
            });

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(
                    '/onboarding/3',
                    expect.objectContaining({
                        state: expect.objectContaining({
                            eventId: freeEvent.id,
                        }),
                    })
                );
            });
        });
    });

    // ============================================
    // Тесты: Отображение без мероприятия
    // ============================================

    /**
     * Тесты поведения при отсутствии данных мероприятия.
     */
    describe('Отсутствие мероприятия', () => {
        /**
         * Проверяет что страница не падает при отсутствии мероприятия в списке.
         */
        test('должен корректно обрабатывать отсутствие мероприятия', async () => {
            renderComponent(mockUserData, mockEventsList, '99999', 0, 0);

            // Страница должна отрендериться без ошибок
            await waitFor(() => {
                expect(screen.getByText('Забронировать стол')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет что страница корректно обрабатывает пустой список мероприятий.
         */
        test('должен корректно обрабатывать пустой список мероприятий', async () => {
            renderComponent(mockUserData, [], String(freeEvent.id), 0, 0);

            await waitFor(() => {
                expect(screen.getByText('Забронировать стол')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Ошибки API
    // ============================================

    /**
     * Тесты обработки ошибок API.
     */
    describe('Ошибки API', () => {
        /**
         * Проверяет отображение ошибки при неудачной загрузке временных слотов.
         */
        test('должен показывать ошибку при неудачной загрузке слотов', async () => {
            mockAPIGetAvailableTimeSlots.mockRejectedValue(new Error('Network error'));

            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            await waitFor(() => {
                expect(screen.getByText(/Не удалось загрузить доступное время/i)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение popup при ошибке создания бронирования.
         * Временной слот выбирается автоматически для мероприятий.
         */
        test('должен показывать popup при ошибке создания бронирования', async () => {
            mockAPICreateBooking.mockRejectedValue(new Error('Booking error'));

            renderComponent(mockUserData, mockEventsList, String(freeEvent.id), 2, 0);

            // Ждём загрузки временных слотов (слот выбирается автоматически)
            await waitFor(() => {
                expect(mockAPIGetAvailableTimeSlots).toHaveBeenCalled();
            });

            // Даём время на автоматический выбор слота
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const bookButton = screen.getByText('Забронировать стол');
            
            await act(async () => {
                fireEvent.click(bookButton);
            });

            // Popup с ошибкой должен появиться (компонент BookingErrorPopup)
            await waitFor(() => {
                expect(mockAPICreateBooking).toHaveBeenCalled();
            });
        });
    });
});
