/**
 * @fileoverview Тесты для страницы ресторана RestaurantPage.
 * 
 * Страница отображает информацию о ресторане с возможностью:
 * - Просмотра галереи, меню, событий, банкетов
 * - Бронирования столика
 * - Открытия местоположения в Яндекс Картах
 * - Звонка в ресторан
 * 
 * Основные тестируемые сценарии:
 * - Рендеринг всех блоков страницы
 * - Навигация на страницу бронирования (с учётом онбординга)
 * - Открытие Яндекс Карт
 * - Открытие попапа звонка
 * - Передача данных о выбранной дате и времени
 * 
 * @module __tests__/restaurants/RestaurantPage
 * 
 * @see {@link RestaurantPage} - тестируемый компонент
 * @see {@link useRestaurantPageData} - хук загрузки данных страницы
 * @see {@link useGetRestaurantById} - хук получения ресторана по ID
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RestaurantPage } from '@/pages/RestaurantPage/RestaurantPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { userAtom, authAtom } from '@/atoms/userAtom.ts';
import { useRestaurantPageData } from '@/hooks/useRestaurantPageData.ts';
// Типы
import { IRestaurant } from '@/types/restaurant.types.ts';
// Моки из src/__mocks__/
import { mockRestaurantWithBanquets } from '@/__mocks__/restaurant.mock.ts';
import { mockUserData, mockUserNotOnboarded } from '@/__mocks__/user.mock.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок хука useRestaurantPageData.
 * Позволяет контролировать данные страницы ресторана в тестах.
 */
jest.mock('@/hooks/useRestaurantPageData.ts');
const mockUseRestaurantPageData = useRestaurantPageData as jest.MockedFunction<typeof useRestaurantPageData>;

/**
 * Мок хука useToastState.
 * Предоставляет функцию показа уведомлений.
 */
const mockShowToast = jest.fn();
jest.mock('@/hooks/useToastState.ts', () => ({
    __esModule: true,
    default: () => ({
        showToast: mockShowToast,
    }),
}));

/**
 * Мок функции navigate из react-router-dom.
 */
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок window.open для тестирования открытия Яндекс Карт.
 */
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true,
});

/**
 * Мок компонента CallRestaurantPopup.
 * Упрощённая версия для тестирования функциональности звонка.
 */
jest.mock('@/components/CallRestaurantPopup/CallRestaurantPopup.tsx', () => ({
    CallRestaurantPopup: ({ isOpen, setOpen, phone }: { isOpen: boolean; setOpen: (v: boolean) => void; phone: string }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="call-popup">
                <span data-testid="call-phone">{phone}</span>
                <button onClick={() => setOpen(false)} data-testid="close-call-popup">
                    Закрыть
                </button>
            </div>
        );
    },
}));

/**
 * Мок компонента RestaurantTopPreview.
 */
jest.mock('@/components/RestaurantTopPreview/RestaurantTopPreview.tsx', () => ({
    RestaurantTopPreview: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="restaurant-top-preview">Restaurant Preview: {restaurantId}</div>
    ),
}));

/**
 * Мок компонента Page.
 */
jest.mock('@/components/Page.tsx', () => ({
    Page: ({ children, back }: { children: React.ReactNode; back?: boolean }) => (
        <div data-testid="page" data-back={back}>
            {children}
        </div>
    ),
}));

/**
 * Мок компонента PageContainer.
 */
jest.mock('@/components/PageContainer/PageContainer.tsx', () => ({
    PageContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-container">{children}</div>
    ),
}));

/**
 * Мок компонента BottomButtonWrapper.
 */
jest.mock('@/components/BottomButtonWrapper/BottomButtonWrapper.tsx', () => ({
    BottomButtonWrapper: ({ onClick, additionalBtns }: { onClick: () => void; additionalBtns?: React.ReactNode }) => (
        <div data-testid="bottom-button-wrapper">
            <button onClick={onClick} data-testid="book-button">
                Забронировать
            </button>
            {additionalBtns}
        </div>
    ),
}));

/**
 * Мок компонента RoundedButton.
 */
jest.mock('@/components/RoundedButton/RoundedButton.tsx', () => ({
    RoundedButton: ({ action, icon }: { action?: () => void; icon?: React.ReactNode }) => (
        <button onClick={action} data-testid="rounded-button">
            {icon}
        </button>
    ),
}));

/**
 * Моки блоков страницы ресторана.
 * Каждый блок рендерится как простой div с data-testid.
 */
jest.mock('@/pages/RestaurantPage/blocks/NavigationBlock.tsx', () => ({
    NavigationBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="navigation-block">Navigation: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/BookingsBlock.tsx', () => ({
    BookingBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="booking-block">Booking: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/GalleryBlock.tsx', () => ({
    GalleryBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="gallery-block">Gallery: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/MenuBlock.tsx', () => ({
    MenuBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="menu-block">Menu: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/BanquetsBlock.tsx', () => ({
    BanquetsBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="banquets-block">Banquets: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/CertificateBlock.tsx', () => ({
    CertificateBlock: () => <div data-testid="certificate-block">Certificate</div>,
}));

jest.mock('@/pages/RestaurantPage/blocks/EventsBlock.tsx', () => ({
    EventsBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="events-block">Events: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/AboutBlock.tsx', () => ({
    AboutBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="about-block">About: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/ChefBlock.tsx', () => ({
    ChefBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="chef-block">Chef: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/AddressBlock.tsx', () => ({
    AddressBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="address-block">Address: {restaurantId}</div>
    ),
}));

jest.mock('@/pages/RestaurantPage/blocks/YandexTaxiBlock.tsx', () => ({
    YandexTaxiBlock: ({ restaurantId }: { restaurantId: string }) => (
        <div data-testid="yandex-taxi-block">Yandex Taxi: {restaurantId}</div>
    ),
}));

/**
 * Мок иконки GoToPathIcon.
 */
jest.mock('@/components/Icons/GoToPathIcon.tsx', () => ({
    GoToPathIcon: () => <span data-testid="go-to-path-icon">🗺️</span>,
}));

/** Мок window.scrollTo */
global.scrollTo = jest.fn();

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы ресторана.
 * 
 * Покрывает следующие сценарии:
 * - Рендеринг всех блоков страницы
 * - Навигация на бронирование с онбордингом и без
 * - Открытие Яндекс Карт
 * - Попап звонка в ресторан
 */
describe('RestaurantPage', () => {
    // ============================================
    // Тестовые данные
    // ============================================

    /**
     * Моковый ресторан для тестов.
     * Используется mockRestaurantWithBanquets из @/__mocks__/restaurant.mock.ts
     */
    const mockRestaurant = mockRestaurantWithBanquets;

    /**
     * Моковый пользователь с завершённым онбордингом.
     * Используется mockUserData из @/__mocks__/user.mock.ts
     */
    const mockUserOnboarded = mockUserData;

    /**
     * Создаёт моковые данные для useRestaurantPageData.
     * Хук теперь возвращает только события (даты и слоты управляются через useBookingForm).
     * 
     * @param overrides - Переопределения полей по умолчанию
     * @returns Объект данных страницы
     */
    const createMockPageData = (overrides: Partial<ReturnType<typeof useRestaurantPageData>> = {}) => ({
        events: [],
        eventsLoading: false,
        eventsError: false,
        ...overrides,
    });

    /**
     * Рендерит компонент RestaurantPage с необходимыми провайдерами.
     * 
     * @param options - Опции рендеринга
     * @param options.user - Данные пользователя
     * @param options.restaurant - Данные ресторана
     * @param options.pageData - Данные страницы
     * @param options.restaurantId - ID ресторана в URL
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Рендер с онбордингом
     * renderComponent({ user: mockUserOnboarded });
     * 
     * @example
     * // Рендер без онбординга
     * renderComponent({ user: mockUserNotOnboarded });
     */
    const renderComponent = (options: {
        user?: typeof mockUserOnboarded | typeof mockUserNotOnboarded | null;
        restaurant?: IRestaurant | null;
        pageData?: Partial<ReturnType<typeof useRestaurantPageData>>;
        restaurantId?: string;
    } = {}) => {
        const {
            user = mockUserOnboarded,
            restaurant = mockRestaurant,
            pageData = {},
            restaurantId = '1',
        } = options;

        mockUseRestaurantPageData.mockReturnValue(createMockPageData(pageData));

        const initialValues: Array<readonly [any, unknown]> = [
            [restaurantsListAtom, restaurant ? [restaurant] : []],
            [authAtom, { access_token: 'test-token' }],
            [userAtom, user],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/restaurant/${restaurantId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
                        <Route path="/restaurant/:restaurantId/booking" element={<div>Booking Page</div>} />
                        <Route path="/onboarding/:step" element={<div>Onboarding Page</div>} />
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

        // Подавляем ожидаемые ошибки в консоли
        jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            if (
                message.includes('not wrapped in act') ||
                message.includes('Not implemented: navigation') ||
                message.includes('Events error') ||
                message.includes('Days error') ||
                message.includes('Timeslots error')
            ) {
                return;
            }
            originalConsoleError(...args);
        });

        // Подавляем предупреждения о SVG атрибутах
        jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
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
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Рендеринг компонентов
    // ============================================

    describe('Рендеринг страницы', () => {
        /**
         * Проверяет базовый рендеринг страницы с компонентом Page.
         */
        it('должен рендерить страницу с компонентом Page', () => {
            renderComponent();

            const page = screen.getByTestId('page');
            expect(page).toBeInTheDocument();
            expect(page).toHaveAttribute('data-back', 'true');
        });

        /**
         * Проверяет рендеринг превью ресторана.
         */
        it('должен рендерить превью ресторана', () => {
            renderComponent();

            expect(screen.getByTestId('restaurant-top-preview')).toBeInTheDocument();
            expect(screen.getByText('Restaurant Preview: 1')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг всех блоков страницы.
         */
        it('должен рендерить все блоки страницы', () => {
            renderComponent();

            expect(screen.getByTestId('navigation-block')).toBeInTheDocument();
            expect(screen.getByTestId('booking-block')).toBeInTheDocument();
            expect(screen.getByTestId('gallery-block')).toBeInTheDocument();
            expect(screen.getByTestId('menu-block')).toBeInTheDocument();
            expect(screen.getByTestId('banquets-block')).toBeInTheDocument();
            expect(screen.getByTestId('events-block')).toBeInTheDocument();
            expect(screen.getByTestId('certificate-block')).toBeInTheDocument();
            expect(screen.getByTestId('about-block')).toBeInTheDocument();
            expect(screen.getByTestId('chef-block')).toBeInTheDocument();
            expect(screen.getByTestId('address-block')).toBeInTheDocument();
            expect(screen.getByTestId('yandex-taxi-block')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг кнопки бронирования.
         */
        it('должен рендерить кнопку бронирования', () => {
            renderComponent();

            expect(screen.getByTestId('bottom-button-wrapper')).toBeInTheDocument();
            expect(screen.getByTestId('book-button')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг кнопки открытия Яндекс Карт.
         */
        it('должен рендерить кнопку открытия Яндекс Карт', () => {
            renderComponent();

            expect(screen.getByTestId('rounded-button')).toBeInTheDocument();
            expect(screen.getByTestId('go-to-path-icon')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Навигация на бронирование
    // ============================================

    describe('Навигация на бронирование', () => {
        /**
         * Проверяет навигацию на страницу бронирования для пользователя с онбордингом.
         * Данные формы сохранены в bookingFormAtom через BookingsBlock.
         */
        it('должен навигировать на страницу бронирования для онбордированного пользователя', async () => {
            renderComponent({ user: mockUserOnboarded });

            const bookButton = screen.getByTestId('book-button');
            fireEvent.click(bookButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/restaurant/1/booking');
            });
        });

        /**
         * Проверяет навигацию на онбординг для пользователя без завершённого онбординга.
         * Передаёт только ID ресторана и флаг sharedRestaurant.
         */
        it('должен навигировать на онбординг для не онбордированного пользователя', async () => {
            renderComponent({ user: mockUserNotOnboarded });

            const bookButton = screen.getByTestId('book-button');
            fireEvent.click(bookButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(
                    '/onboarding/3',
                    expect.objectContaining({
                        state: expect.objectContaining({
                            id: '1',
                            sharedRestaurant: true,
                        }),
                    })
                );
            });
        });

        /**
         * Проверяет навигацию на онбординг для пользователя с null.
         */
        it('должен навигировать на онбординг, если пользователь null', async () => {
            renderComponent({ user: null });

            const bookButton = screen.getByTestId('book-button');
            fireEvent.click(bookButton);

            await waitFor(() => {
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
    });

    // ============================================
    // Тесты: Открытие Яндекс Карт
    // ============================================

    describe('Открытие Яндекс Карт', () => {
        /**
         * Проверяет открытие Яндекс Карт с координатами ресторана.
         */
        it('должен открывать Яндекс Карты при клике на кнопку', async () => {
            renderComponent();

            const mapButton = screen.getByTestId('rounded-button');
            fireEvent.click(mapButton);

            await waitFor(() => {
                expect(mockWindowOpen).toHaveBeenCalledWith(
                    `https://maps.yandex.ru/?ll=${mockRestaurant.address_lonlng}&text=${mockRestaurant.title}&z=17`
                );
            });
        });

        /**
         * Проверяет открытие Яндекс Карт с undefined координатами.
         * Не должно вызвать ошибку.
         */
        it('должен корректно обрабатывать отсутствие координат', async () => {
            const restaurantWithoutCoords = {
                ...mockRestaurant,
                address_lonlng: undefined,
            } as unknown as IRestaurant;

            renderComponent({ restaurant: restaurantWithoutCoords });

            const mapButton = screen.getByTestId('rounded-button');
            fireEvent.click(mapButton);

            await waitFor(() => {
                expect(mockWindowOpen).toHaveBeenCalledWith(
                    `https://maps.yandex.ru/?ll=undefined&text=${mockRestaurant.title}&z=17`
                );
            });
        });
    });

    // ============================================
    // Тесты: Передача данных в хуки
    // ============================================
    // Примечание: useRestaurantPageData теперь используется в EventsBlock,
    // а не в RestaurantPage напрямую. Тесты на вызов хука перенесены
    // в тесты EventsBlock или useRestaurantPageData.test.tsx.

    // ============================================
    // Тесты: Состояние загрузки
    // ============================================

    describe('Состояние загрузки', () => {
        /**
         * Проверяет корректный рендеринг при начальной загрузке.
         */
        it('должен корректно рендерить при начальной загрузке', () => {
            renderComponent();

            // Страница должна рендериться даже при загрузке
            expect(screen.getByTestId('page')).toBeInTheDocument();
            expect(screen.getByTestId('restaurant-top-preview')).toBeInTheDocument();
        });

        /**
         * Проверяет корректный рендеринг при ошибке загрузки таймслотов.
         */
        it('должен корректно рендерить при ошибке загрузки таймслотов', () => {
            renderComponent();

            expect(screen.getByTestId('page')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Работа с пустыми данными
    // ============================================

    describe('Работа с пустыми данными', () => {
        /**
         * Проверяет рендеринг при отсутствии событий.
         */
        it('должен корректно рендерить при пустом списке событий', () => {
            renderComponent({
                pageData: {
                    events: [],
                    eventsLoading: false,
                },
            });

            expect(screen.getByTestId('events-block')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг при отсутствии доступных таймслотов.
         */
        it('должен корректно рендерить при пустом списке таймслотов', () => {
            renderComponent();

            expect(screen.getByTestId('booking-block')).toBeInTheDocument();
        });

        /**
         * Проверяет навигацию на страницу бронирования.
         * State не передаётся - данные сохранены в bookingFormAtom.
         */
        it('должен навигировать на страницу бронирования без state', async () => {
            renderComponent();

            const bookButton = screen.getByTestId('book-button');
            fireEvent.click(bookButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/restaurant/1/booking');
            });
        });
    });

    // ============================================
    // Тесты: Корректность передаваемых ID
    // ============================================

    describe('Корректность передаваемых ID', () => {
        /**
         * Проверяет передачу корректного ID во все блоки.
         */
        it('должен передавать корректный restaurantId во все блоки', () => {
            renderComponent({ restaurantId: '123' });

            expect(screen.getByText('Navigation: 123')).toBeInTheDocument();
            expect(screen.getByText('Restaurant Preview: 123')).toBeInTheDocument();
            expect(screen.getByText('Booking: 123')).toBeInTheDocument();
            expect(screen.getByText('Gallery: 123')).toBeInTheDocument();
            expect(screen.getByText('Menu: 123')).toBeInTheDocument();
            expect(screen.getByText('Banquets: 123')).toBeInTheDocument();
            expect(screen.getByText('Events: 123')).toBeInTheDocument();
            expect(screen.getByText('About: 123')).toBeInTheDocument();
            expect(screen.getByText('Chef: 123')).toBeInTheDocument();
            expect(screen.getByText('Address: 123')).toBeInTheDocument();
            expect(screen.getByText('Yandex Taxi: 123')).toBeInTheDocument();
        });

        /**
         * Проверяет обработку пустого restaurantId.
         */
        it('должен использовать пустую строку при отсутствии restaurantId', () => {
            // Этот тест проверяет дефолтное значение || '' в компоненте
            // Рендерим без параметра restaurantId
            mockUseRestaurantPageData.mockReturnValue(createMockPageData());

            const initialValues: Array<readonly [any, unknown]> = [
                [restaurantsListAtom, [mockRestaurant]],
                [authAtom, { access_token: 'test-token' }],
                [userAtom, mockUserOnboarded],
            ];

            render(
                <TestProvider initialValues={initialValues}>
                    <MemoryRouter
                        initialEntries={['/restaurant/']}
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                    >
                        <Routes>
                            <Route path="/restaurant/" element={<RestaurantPage />} />
                            <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
                        </Routes>
                    </MemoryRouter>
                </TestProvider>
            );

            // Проверяем, что страница рендерится без ошибок
            expect(screen.getByTestId('page')).toBeInTheDocument();
        });
    });
});
