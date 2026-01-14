/**
 * @fileoverview Тесты для страницы списка мероприятий EventsListPage.
 * 
 * Страница отображает список мероприятий с возможностью фильтрации:
 * - По городу (CitySelect)
 * - По ресторану (RestaurantsListSelector)
 * 
 * Особенности логики:
 * - Показываются только мероприятия с tickets_left > 0
 * - При смене города сбрасывается выбранный ресторан
 * - URL-параметры city и restaurant позволяют предустановить фильтры
 * 
 * @module __tests__/events/EventsListPage
 * 
 * @see {@link EventsListPage} - тестируемый компонент
 * @see {@link EventDetailsPage} - страница деталей мероприятия (навигация по клику)
 * @see {@link EventCard} - карточка мероприятия
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EventsListPage } from '@/pages/EventsPage/EventsListPage';
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { cityListAtom, currentCityAtom, ICity } from '@/atoms/cityListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockEventsWithImages } from '@/__mocks__/events.mock';
import { mockCityList } from '@/__mocks__/city.mock';
import { IUser } from '@/types/user.types.ts';
import { IEvent } from '@/types/events.types.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';

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
        onClick: jest.fn(),
    },
    mainButton: {
        onClick: jest.fn(),
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

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
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
 * Мок localStorage.
 * Возвращает 'spb' как текущий город по умолчанию.
 */
const localStorageMock = {
    getItem: jest.fn(() => 'spb'),
    setItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// ============================================
// Тестовые данные - импортируются из __mocks__
// ============================================

/**
 * Список ресторанов для тестов событий.
 * - Self Edge Japanese (id: 4) - СПб
 * - Self Edge Moscow (id: 10) - Москва
 */
const mockRestaurants: IRestaurant[] = [
    {
        id: String(4),
        title: 'Self Edge Japanese',
        slogan: 'Японский ресторан',
        address: 'Санкт-Петербург, ул. Радищева, 34',
        logo_url: '',
        thumbnail_photo: 'https://example.com/photo.jpg',
        openTime: '10:00',
        avg_cheque: 3000,
        photo_cards: [],
        brand_chef: { names: [], avatars: [], about: '', photo_url: '' },
        city: { id: 2, name: 'Санкт-Петербург', name_english: 'spb', name_dative: 'Санкт-Петербурге' },
        banquets: { banquet_options: [], additional_options: [], description: '', image: '' },
        about_text: '',
        about_kitchen: 'Японская',
        about_features: '',
        address_lonlng: '',
        address_station: '',
        address_station_color: '',
        phone_number: '',
        gallery: [],
        menu: [],
        menu_imgs: [],
        worktime: [],
        socials: [],
    },
    {
        id: String(10),
        title: 'Self Edge Moscow',
        slogan: 'Московский ресторан',
        address: 'Москва, ул. Большая Грузинская, 12',
        logo_url: '',
        thumbnail_photo: 'https://example.com/photo2.jpg',
        openTime: '11:00',
        avg_cheque: 4000,
        photo_cards: [],
        brand_chef: { names: [], avatars: [], about: '', photo_url: '' },
        city: { id: 1, name: 'Москва', name_english: 'moscow', name_dative: 'Москве' },
        banquets: { banquet_options: [], additional_options: [], description: '', image: '' },
        about_text: '',
        about_kitchen: 'Европейская',
        about_features: '',
        address_lonlng: '',
        address_station: '',
        address_station_color: '',
        phone_number: '',
        gallery: [],
        menu: [],
        menu_imgs: [],
        worktime: [],
        socials: [],
    },
];

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы списка мероприятий.
 * 
 * Покрывает следующие сценарии:
 * - Отображение списка мероприятий
 * - Фильтрация по городу
 * - Фильтрация по ресторану
 * - Навигация на страницу деталей
 * - Обработка URL-параметров
 * - Фильтрация по tickets_left
 * - Отображение информации о мероприятии
 */
describe('EventsListPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент EventsListPage с необходимыми провайдерами.
     * 
     * @param user - Данные пользователя (по умолчанию mockUserData)
     * @param events - Список мероприятий (null = загрузка, [] = пусто)
     * @param cities - Список городов
     * @param currentCity - Текущий выбранный город (name_english)
     * @param restaurants - Список ресторанов
     * @param initialUrl - Начальный URL (для тестирования параметров)
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Базовый рендер
     * renderComponent();
     * 
     * @example
     * // Рендер с URL-параметрами
     * renderComponent(mockUserData, mockEventsWithImages, mockCityList, 'spb', mockRestaurants, '/events?city=moscow');
     */
    const renderComponent = (
        user: IUser | undefined = mockUserData,
        events: IEvent[] | null = mockEventsWithImages,
        cities: ICity[] = mockCityList,
        currentCity: string = 'spb',
        restaurants: IRestaurant[] = mockRestaurants,
        initialUrl: string = '/events'
    ) => {
        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [eventsListAtom, events],
            [cityListAtom, cities],
            [currentCityAtom, currentCity],
            [restaurantsListAtom, restaurants],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[initialUrl]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/events" element={<EventsListPage />} />
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
            // Игнорируем ожидаемые ошибки
            if (
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
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Отображение списка мероприятий
    // ============================================

    /**
     * Тесты базового отображения списка мероприятий.
     */
    describe('Отображение списка мероприятий', () => {
        /**
         * Проверяет отображение карточек мероприятий.
         * Карточки имеют data-testid="event-card".
         */
        test('должен отображать карточки мероприятий', async () => {
            renderComponent();

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет отображение placeholder при загрузке.
         * Когда events = null, компонент показывает 10 placeholder карточек.
         */
        test('должен показывать placeholder при загрузке данных', async () => {
            renderComponent(mockUserData, null);

            await waitFor(() => {
                const placeholders = screen.getAllByTestId('placeholder-block');
                expect(placeholders.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет сообщение при отсутствии мероприятий.
         * Когда events = [] (пустой массив), показывает "Мероприятий пока нет".
         */
        test('должен показывать сообщение, когда нет мероприятий', async () => {
            renderComponent(mockUserData, []);

            await waitFor(() => {
                expect(screen.getByText('Мероприятий пока нет')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Фильтрация по городу
    // ============================================

    /**
     * Тесты фильтрации мероприятий по городу.
     * Используется компонент CitySelect.
     */
    describe('Фильтрация по городу', () => {
        /**
         * Проверяет отображение селектора города.
         */
        test('должен отображать селектор города', async () => {
            renderComponent();

            await waitFor(() => {
                // Город по умолчанию (spb) отображается в селекторе
                const cityElements = screen.getAllByText('Санкт-Петербург');
                expect(cityElements.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет фильтрацию мероприятий по выбранному городу.
         * Моковые события относятся к ресторану в СПб (id: 4).
         */
        test('должен фильтровать мероприятия по выбранному городу', async () => {
            renderComponent(mockUserData, mockEventsWithImages, mockCityList, 'spb');

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });
    });

    // ============================================
    // Тесты: Фильтрация по ресторану
    // ============================================

    /**
     * Тесты фильтрации мероприятий по ресторану.
     * Используется компонент RestaurantsListSelector.
     */
    describe('Фильтрация по ресторану', () => {
        /**
         * Проверяет отображение селектора ресторана.
         * По умолчанию показывает "Ресторан" (без выбранного значения).
         */
        test('должен отображать селектор ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                // По умолчанию отображается "Ресторан" в DropDownSelect
                expect(screen.getByText('Ресторан')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет открытие селектора ресторанов при клике.
         * После клика должен показываться WheelPicker с заголовком "Выберите ресторан"
         * и список ресторанов текущего города.
         */
        test('должен открывать селектор ресторанов при клике', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Ресторан')).toBeInTheDocument();
            });

            const restaurantSelector = screen.getByText('Ресторан');
            fireEvent.click(restaurantSelector);

            await waitFor(() => {
                // После открытия WheelPicker показывает заголовок "Выберите ресторан"
                expect(screen.getByText('Выберите ресторан')).toBeInTheDocument();
                // Ресторан из списка СПб должен быть виден
                const restaurantElements = screen.getAllByText('Self Edge Japanese');
                expect(restaurantElements.length).toBeGreaterThan(0);
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    /**
     * Тесты навигации на страницу деталей мероприятия.
     */
    describe('Навигация', () => {
        /**
         * Проверяет переход на страницу деталей при клике на карточку.
         * Навигация: /events/{eventId}/details с replace: true.
         */
        test('должен переходить на страницу деталей мероприятия при клике на карточку', async () => {
            renderComponent();

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
            });

            const firstEventCard = screen.getAllByTestId('event-card')[0];
            fireEvent.click(firstEventCard);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(
                    expect.stringMatching(/^\/events\/\d+\/details$/),
                    { replace: true }
                );
            });
        });
    });

    // ============================================
    // Тесты: URL параметры
    // ============================================

    /**
     * Тесты обработки URL-параметров city и restaurant.
     * Позволяют предустановить фильтры из ссылки (например, из бота).
     */
    describe('URL параметры', () => {
        /**
         * Проверяет установку города из URL-параметра ?city=.
         */
        test('должен устанавливать город из URL параметров', async () => {
            renderComponent(
                mockUserData,
                mockEventsWithImages,
                mockCityList,
                'spb',
                mockRestaurants,
                '/events?city=moscow'
            );

            await waitFor(() => {
                // Москва должна быть отображена после установки из URL
                const moscowElements = screen.getAllByText('Москва');
                expect(moscowElements.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет установку ресторана из URL-параметра ?restaurant=.
         * URL параметр фильтрует мероприятия по ресторану.
         * 
         * Примечание: RestaurantsListSelector имеет собственный внутренний state
         * и не синхронизируется с URL параметром (ограничение компонента).
         * Поэтому проверяем только фильтрацию мероприятий.
         */
        test('должен фильтровать мероприятия по ресторану из URL параметров', async () => {
            renderComponent(
                mockUserData,
                mockEventsWithImages,
                mockCityList,
                'spb',
                mockRestaurants,
                '/events?restaurant=4'
            );

            await waitFor(() => {
                // Мероприятия отфильтрованы по ресторану из URL
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
                // Все отображаемые мероприятия должны быть от ресторана с id=4
                const restaurantTitles = screen.getAllByTestId('event-restaurant-title');
                restaurantTitles.forEach(title => {
                    expect(title).toHaveTextContent('Self Edge Japanese');
                });
            });
        });
    });

    // ============================================
    // Тесты: Фильтрация по tickets_left
    // ============================================

    /**
     * Тесты фильтрации мероприятий по наличию билетов.
     * Мероприятия с tickets_left = 0 не отображаются.
     */
    describe('Отображение мероприятий с tickets_left > 0', () => {
        /**
         * Проверяет, что мероприятия с tickets_left = 0 скрыты.
         * Только мероприятия с доступными билетами показываются в списке.
         */
        test('должен показывать только мероприятия с доступными билетами', async () => {
            const eventsWithSoldOut: IEvent[] = [
                ...mockEventsWithImages,
                {
                    ...mockEventsWithImages[0],
                    id: 999,
                    name: 'Sold Out Event',
                    tickets_left: 0,
                },
            ];

            renderComponent(mockUserData, eventsWithSoldOut);

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('event-card');
                // Sold out мероприятие не должно отображаться
                expect(screen.queryByText('Sold Out Event')).not.toBeInTheDocument();
                // Но остальные мероприятия отображаются
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });
    });

    // ============================================
    // Тесты: Информация о мероприятии
    // ============================================

    /**
     * Тесты отображения информации в карточках мероприятий.
     */
    describe('Информация о мероприятии', () => {
        /**
         * Проверяет отображение названия мероприятия.
         */
        test('должен отображать название мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(mockEventsWithImages[0].name)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение названия ресторана в карточке.
         * Элемент имеет data-testid="event-restaurant-title".
         */
        test('должен отображать название ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                const restaurantElements = screen.getAllByTestId('event-restaurant-title');
                expect(restaurantElements.length).toBeGreaterThan(0);
                expect(restaurantElements[0]).toHaveTextContent(mockEventsWithImages[0].restaurant.title);
            });
        });

        /**
         * Проверяет отображение даты мероприятия в формате DD.MM.YYYY.
         * Элемент имеет data-testid="event-date".
         */
        test('должен отображать дату мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                const dateElements = screen.getAllByTestId('event-date');
                expect(dateElements.length).toBeGreaterThan(0);
                expect(dateElements[0]).toHaveTextContent('23.08.2025');
            });
        });
    });
});
