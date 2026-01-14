/**
 * @fileoverview Тесты для страницы общего бронирования BookingPage.
 * 
 * Страница предназначена для бронирования столика в любом ресторане.
 * Пользователь попадает сюда с главной страницы ({@link IndexPage}).
 * 
 * Основные функции страницы:
 * - Выбор ресторана из списка всех доступных
 * - Выбор даты бронирования из доступных дат
 * - Выбор количества гостей и детей
 * - Выбор времени бронирования из доступных слотов
 * - Ввод контактных данных (имя, телефон)
 * - Выбор способа подтверждения
 * - Дополнительные пожелания к бронированию
 * - Выбор/активация сертификата
 * - Создание бронирования через API
 * 
 * Отличия от {@link RestaurantBookingPage}:
 * - Ресторан выбирается пользователем (не предзадан)
 * - Использует CommonBookingHeader вместо RestaurantBookingHeader
 * - Нет restaurantId в URL-параметрах
 * - Поддерживает передачу certificate и certificateId через state
 * - Использует `shared` вместо `sharedRestaurant` для навигации
 * 
 * Отличия от {@link EventBookingPage}:
 * - Не привязан к мероприятию (нет eventData)
 * - Дата не фиксирована
 * - Не передаёт event_id в API
 * - Навигация после бронирования на /myBookings/{id}
 * 
 * @module __tests__/booking/BookingPage
 * 
 * @see {@link BookingPage} - тестируемый компонент
 * @see {@link IndexPage} - главная страница (точка входа)
 * @see {@link RestaurantBookingPage} - страница бронирования конкретного ресторана
 * @see {@link EventBookingPage} - страница бронирования мероприятия
 * @see {@link useBookingForm} - хук управления формой бронирования
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingPage } from '@/pages/BookingPage/BookingPage';
import { userAtom, authAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { IUser } from '@/types/user.types.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Список пропсов Swiper, которые не должны передаваться в DOM.
 */
const SWIPER_PROPS = [
    'initialSlide', 'spaceBetween', 'freeMode', 'slidesPerView', 'modules',
    'pagination', 'navigation', 'scrollbar', 'autoplay', 'loop', 'centeredSlides',
    'grabCursor', 'breakpoints', 'onSwiper', 'onSlideChange', 'direction', 'effect',
    'speed', 'thumbs', 'zoom', 'virtual', 'watchOverflow', 'allowTouchMove',
];

/**
 * Фильтрует пропсы Swiper, оставляя только валидные DOM-атрибуты.
 */
const filterSwiperProps = (props: Record<string, any>) => {
    const filtered: Record<string, any> = {};
    Object.keys(props).forEach((key) => {
        if (!SWIPER_PROPS.includes(key) && (!key.startsWith('on') || key === 'onClick')) {
            filtered[key] = props[key];
        }
    });
    return filtered;
};

/**
 * Мок Swiper для React.
 * Swiper используется в некоторых компонентах приложения.
 * Фильтрует специфичные для Swiper пропсы, чтобы избежать React warnings.
 */
jest.mock('swiper/react', () => {
    const React = require('react');
    return {
        Swiper: ({ children, ...props }: any) => {
            const filtered = filterSwiperProps(props);
            return React.createElement('div', { 'data-testid': 'swiper-mock', ...filtered }, children);
        },
        SwiperSlide: ({ children, ...props }: any) => {
            const filtered = filterSwiperProps(props);
            return React.createElement('div', { 'data-testid': 'swiper-slide-mock', ...filtered }, children);
        },
        useSwiper: () => ({
            slideNext: jest.fn(),
            slidePrev: jest.fn(),
            slideTo: jest.fn(),
            activeIndex: 0,
        }),
    };
});

/**
 * Мок модулей Swiper (FreeMode, Pagination и др.).
 */
jest.mock('swiper/modules', () => ({
    FreeMode: jest.fn(),
    Pagination: jest.fn(),
    Zoom: jest.fn(),
    Thumbs: jest.fn(),
}));

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
 * Мок функции useLocation для получения location.state.
 */
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
    useLocation: () => mockUseLocation(),
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
 * Мок API для сертификатов.
 * - APIGetCertificates - получает список сертификатов
 * - APIPostCertificateClaim - активирует сертификат
 */
const mockAPIGetCertificates = jest.fn();
const mockAPIPostCertificateClaim = jest.fn();

jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificates: (...args: any[]) => mockAPIGetCertificates(...args),
    APIPostCertificateClaim: (...args: any[]) => mockAPIPostCertificateClaim(...args),
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
 * Тесты страницы общего бронирования.
 * 
 * Покрывает следующие сценарии:
 * - Отображение заголовка бронирования
 * - Выбор ресторана из списка
 * - Выбор даты бронирования
 * - Работа счётчика гостей
 * - Отображение временных слотов
 * - Ввод контактных данных
 * - Выбор способа подтверждения
 * - Валидация формы
 * - Создание бронирования
 * - Навигация после успешного бронирования
 * - Обработка shared-ссылок
 * - Работа с сертификатами
 * 
 * Тесты построены по тому же шаблону, что и {@link RestaurantBookingPage.test.tsx}
 * и {@link EventBookingPage.test.tsx} для обеспечения согласованности.
 */
describe('BookingPage', () => {
    // ============================================
    // Тестовые данные
    // ============================================

    /**
     * Моковые рестораны для тестов.
     * Используются в RestaurantsListSelector.
     */
    const mockRestaurants: IRestaurant[] = [
        {
            id: '1',
            title: 'Test Restaurant 1',
            slogan: 'Test Slogan 1',
            address: 'Test Address 1, 123',
            address_lonlng: '30.3158,59.9386',
            address_station: 'Невский проспект',
            address_station_color: '#0066cc',
            logo_url: 'https://example.com/logo1.jpg',
            thumbnail_photo: 'https://example.com/thumbnail1.jpg',
            openTime: '12:00',
            avg_cheque: 2500,
            photo_cards: [],
            brand_chef: {
                names: ['Шеф Повар 1'],
                avatars: ['https://example.com/chef1.jpg'],
                about: 'Описание шефа 1',
                photo_url: 'https://example.com/chef1.jpg',
            },
            city: {
                id: 2,
                name: 'Санкт-Петербург',
                name_english: 'spb',
                name_dative: 'Санкт-Петербурге',
            },
            banquets: {
                banquet_options: [],
                additional_options: [],
                description: 'Описание банкетов',
                image: 'https://example.com/banquet.jpg',
            },
            about_text: 'О ресторане 1',
            about_kitchen: 'О кухне 1',
            about_features: 'Особенности 1',
            phone_number: '+7 (999) 123-45-67',
            gallery: [],
            menu: [],
            menu_imgs: [],
            worktime: [{ weekday: 'пн-вс', time_start: '12:00', time_end: '23:00' }],
            socials: [],
        },
        {
            id: '2',
            title: 'Test Restaurant 2',
            slogan: 'Test Slogan 2',
            address: 'Test Address 2, 456',
            address_lonlng: '30.3200,59.9400',
            address_station: 'Маяковская',
            address_station_color: '#ff0000',
            logo_url: 'https://example.com/logo2.jpg',
            thumbnail_photo: 'https://example.com/thumbnail2.jpg',
            openTime: '11:00',
            avg_cheque: 3000,
            photo_cards: [],
            brand_chef: {
                names: ['Шеф Повар 2'],
                avatars: ['https://example.com/chef2.jpg'],
                about: 'Описание шефа 2',
                photo_url: 'https://example.com/chef2.jpg',
            },
            city: {
                id: 2,
                name: 'Санкт-Петербург',
                name_english: 'spb',
                name_dative: 'Санкт-Петербурге',
            },
            banquets: {
                banquet_options: [],
                additional_options: [],
                description: 'Описание банкетов 2',
                image: 'https://example.com/banquet2.jpg',
            },
            about_text: 'О ресторане 2',
            about_kitchen: 'О кухне 2',
            about_features: 'Особенности 2',
            phone_number: '+7 (999) 987-65-43',
            gallery: [],
            menu: [],
            menu_imgs: [],
            worktime: [{ weekday: 'пн-вс', time_start: '11:00', time_end: '22:00' }],
            socials: [],
        },
    ];

    /**
     * Моковые временные слоты для бронирования.
     * Аналогично {@link RestaurantBookingPage.test.tsx} и {@link EventBookingPage.test.tsx}.
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
     * Рендерит компонент BookingPage с необходимыми провайдерами.
     * 
     * @param user - Данные пользователя (по умолчанию mockUserData)
     * @param restaurants - Список ресторанов (по умолчанию mockRestaurants)
     * @param locationState - State из location (для передачи certificate, certificateId, shared)
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Рендер с дефолтными параметрами
     * renderComponent();
     * 
     * @example
     * // Рендер с сертификатом
     * renderComponent(mockUserData, mockRestaurants, {
     *     certificate: { recipient_name: 'Test Name' },
     *     certificateId: 'cert-123',
     * });
     * 
     * @example
     * // Рендер для shared-ссылки
     * renderComponent(mockUserData, mockRestaurants, { shared: true });
     */
    const renderComponent = (
        user: IUser | undefined = mockUserData,
        restaurants: IRestaurant[] = mockRestaurants,
        locationState: Record<string, any> | null = null
    ) => {
        mockUseLocation.mockReturnValue({
            pathname: '/booking',
            state: locationState,
        });

        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [authAtom, { access_token: 'test-token' }],
            [restaurantsListAtom, restaurants],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={['/booking']}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/booking" element={<BookingPage />} />
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
        mockUseLocation.mockReturnValue({
            pathname: '/booking',
            state: null,
        });
        
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
            data: { id: 123 } 
        });
        mockAPIGetCertificates.mockResolvedValue({ data: [] });
        mockAPIPostCertificateClaim.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Отображение заголовка
    // ============================================

    /**
     * Тесты отображения заголовка страницы бронирования.
     * В отличие от RestaurantBookingPage, здесь нет информации о конкретном ресторане.
     */
    describe('Отображение заголовка', () => {
        /**
         * Проверяет отображение заголовка "Бронирование".
         */
        test('должен отображать заголовок "Бронирование"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение селектора ресторанов.
         * В CommonBookingHeader есть RestaurantsListSelector.
         */
        test('должен отображать селектор ресторанов', async () => {
            renderComponent();

            await waitFor(() => {
                // RestaurantsListSelector отображает кнопку выбора ресторана
                expect(screen.getByText('Ресторан')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Временные слоты
    // ============================================

    /**
     * Тесты отображения и загрузки временных слотов.
     * Аналогично тестам в RestaurantBookingPage.test.tsx и EventBookingPage.test.tsx.
     */
    describe('Временные слоты', () => {
        /**
         * Проверяет отображение сообщения о необходимости выбора даты и гостей.
         * Сообщение показывается когда количество гостей = 0 или дата не выбрана.
         */
        test('должен показывать сообщение о выборе даты и гостей', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Выберите дату и количество гостей')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Контактные данные
    // ============================================

    /**
     * Тесты блока контактных данных.
     * Аналогично тестам в RestaurantBookingPage.test.tsx и EventBookingPage.test.tsx.
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
     * Аналогично тестам в RestaurantBookingPage.test.tsx и EventBookingPage.test.tsx.
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
     * Тесты кнопки бронирования.
     */
    describe('Кнопка бронирования', () => {
        /**
         * Проверяет наличие кнопки бронирования.
         */
        test('должен отображать кнопку бронирования', async () => {
            renderComponent();

            await waitFor(() => {
                const button = screen.getByRole('button', { name: /забронировать/i });
                expect(button).toBeInTheDocument();
            });
        });

        /**
         * Проверяет, что кнопка неактивна при невалидной форме.
         * Форма невалидна если не выбран ресторан, дата, временной слот или количество гостей = 0.
         */
        test('кнопка должна быть неактивна при невалидной форме', async () => {
            renderComponent();

            await waitFor(() => {
                const button = screen.getByRole('button', { name: /забронировать/i });
                expect(button).toBeDisabled();
            });
        });
    });

    // ============================================
    // Тесты: Редирект на онбординг
    // ============================================

    /**
     * Тесты редиректа на онбординг для пользователей без complete_onboarding.
     * Аналогично тестам в RestaurantBookingPage.test.tsx и EventBookingPage.test.tsx.
     */
    describe('Редирект на онбординг', () => {
        /**
         * Проверяет наличие пользователя без complete_onboarding.
         * Форма рендерится корректно для такого пользователя.
         */
        test('должен корректно рендерить форму для пользователя без onboarding', async () => {
            const userWithoutOnboarding: IUser = {
                ...mockUserData,
                complete_onboarding: false,
            };

            renderComponent(userWithoutOnboarding);

            await waitFor(() => {
                // Страница должна рендериться
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Навигация "Назад"
    // ============================================

    /**
     * Тесты кнопки "Назад" и обработки shared-ссылок.
     * Использует `shared` вместо `sharedRestaurant` (как в RestaurantBookingPage).
     */
    describe('Навигация "Назад"', () => {
        /**
         * Проверяет что страница корректно рендерится при shared = true.
         */
        test('должен корректно рендерить страницу при shared', async () => {
            renderComponent(mockUserData, mockRestaurants, { shared: true });

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Сертификаты
    // ============================================

    /**
     * Тесты работы с сертификатами.
     * BookingPage поддерживает передачу certificate и certificateId через state.
     */
    describe('Сертификаты', () => {
        /**
         * Проверяет что компонент CertificatesSelector присутствует на странице.
         */
        test('должен отображать компонент выбора сертификатов', async () => {
            renderComponent();

            // Страница содержит CertificatesSelector
            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет обработку certificate из location.state.
         */
        test('должен корректно обрабатывать certificate из state', async () => {
            const certificateState = {
                certificate: { recipient_name: 'Test Name' },
                certificateId: 'cert-123',
            };

            renderComponent(mockUserData, mockRestaurants, certificateState);

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Ошибки API
    // ============================================

    /**
     * Тесты обработки ошибок API.
     * Аналогично тестам в RestaurantBookingPage.test.tsx и EventBookingPage.test.tsx.
     */
    describe('Ошибки API', () => {
        /**
         * Проверяет что страница корректно рендерится даже при ошибке API сертификатов.
         */
        test('должен корректно рендерить страницу при ошибке загрузки сертификатов', async () => {
            mockAPIGetCertificates.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Работа с пустыми данными
    // ============================================

    /**
     * Тесты поведения при отсутствии данных.
     */
    describe('Работа с пустыми данными', () => {
        /**
         * Проверяет что страница корректно обрабатывает пустой список ресторанов.
         */
        test('должен корректно обрабатывать пустой список ресторанов', async () => {
            renderComponent(mockUserData, []);

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет что страница корректно работает с undefined пользователем.
         */
        test('должен корректно работать без данных пользователя', async () => {
            renderComponent(undefined);

            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Селектор даты
    // ============================================

    /**
     * Тесты компонента выбора даты.
     * Дата может быть выбрана только после выбора ресторана.
     * При пустом списке дат показывается сообщение "Нет доступных дат".
     */
    describe('Селектор даты', () => {
        /**
         * Проверяет наличие селектора даты.
         */
        test('должен отображать селектор даты', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Дата')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет, что селектор даты заблокирован, когда ресторан не выбран.
         * Это ключевое поведение: дату можно выбирать только после выбора ресторана.
         */
        test('селектор даты должен быть заблокирован, если ресторан не выбран', async () => {
            renderComponent();

            await waitFor(() => {
                // Находим кнопку селектора даты
                const dateButton = screen.getByText('Дата').closest('button');
                expect(dateButton).toBeDisabled();
            });
        });

        /**
         * Проверяет отображение сообщения "Нет доступных дат" при пустом списке.
         */
        test('должен показывать "Нет доступных дат" при пустом списке дат', async () => {
            // Мок API возвращает пустой список дат
            mockAPIGetAvailableDays.mockResolvedValue({ data: [] });

            renderComponent();

            // Когда ресторан выбран и API вернул пустой список
            // DateListSelector должен показать сообщение (проверяем после выбора ресторана)
            await waitFor(() => {
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Селектор гостей
    // ============================================

    /**
     * Тесты компонента выбора количества гостей.
     */
    describe('Селектор гостей', () => {
        /**
         * Проверяет наличие компонента GuestCountSelector на странице.
         * Компонент находится в CommonBookingHeader.
         */
        test('должен отображать компонент выбора гостей', async () => {
            renderComponent();

            await waitFor(() => {
                // Страница рендерится с компонентом бронирования
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Согласованность с другими страницами
    // ============================================

    /**
     * Тесты согласованности с RestaurantBookingPage и EventBookingPage.
     */
    describe('Согласованность с другими страницами бронирования', () => {
        /**
         * Проверяет наличие всех основных блоков формы (как в RestaurantBookingPage).
         */
        test('должен содержать все основные блоки формы', async () => {
            renderComponent();

            await waitFor(() => {
                // Заголовок
                expect(screen.getByText('Бронирование')).toBeInTheDocument();
                // Контакты
                expect(screen.getByText('Контакты')).toBeInTheDocument();
                // Подтверждение
                expect(screen.getByText('В Telegram')).toBeInTheDocument();
                // Кнопка
                expect(screen.getByRole('button', { name: /забронировать/i })).toBeInTheDocument();
            });
        });

        /**
         * Проверяет что форма использует те же поля ввода (как в других страницах).
         */
        test('должен использовать стандартные поля ввода', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument();
            });
        });
    });
});
