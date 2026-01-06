import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { EventsListPage } from '@/pages/EventsPage/EventsListPage/EventsListPage.tsx';
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { cityListAtom, getCurrentCity, ICity } from '@/atoms/cityListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockEventsList } from '@/__mocks__/events.mock';
import { IUser } from '@/types/user.types.ts';
import { IEvent, IEventBooking } from '@/types/events.types.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';
import { useState } from 'react';

jest.mock('swiper/react', () => ({
    Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
    FreeMode: jest.fn(),
}));

// Mock Telegram SDK
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

// Mock react-router-dom
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
}));

// Mock Telegram WebApp
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

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(() => 'spb'),
    setItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock города
const mockCityList: ICity[] = [
    { id: 1, name: 'Москва', name_english: 'moscow', name_dative: 'Москве' },
    { id: 2, name: 'Санкт-Петербург', name_english: 'spb', name_dative: 'Санкт-Петербурге' },
];

// Mock рестораны
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

// Mock события с заполненными image_url
const mockEventsWithImages: IEvent[] = mockEventsList.map(e => ({
    ...e,
    image_url: e.image_url || 'https://example.com/default-event-image.jpg',
}));

// Wrapper component to provide OutletContext
const OutletContextWrapper: React.FC = () => {
    const [eventBookingInfo, setEventBookingInfo] = useState<IEventBooking | null>(null);

    return (
        <Outlet context={[eventBookingInfo, setEventBookingInfo]} />
    );
};

describe('EventsListPage', () => {
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
            [getCurrentCity, currentCity],
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
                        <Route element={<OutletContextWrapper />}>
                            <Route path="/events" element={<EventsListPage />} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Отображение списка мероприятий', () => {
        test('должен отображать карточки мероприятий', async () => {
            renderComponent();

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });

        test('должен показывать placeholder при загрузке данных', async () => {
            renderComponent(mockUserData, null);

            await waitFor(() => {
                const placeholders = screen.getAllByTestId('placeholder-block');
                expect(placeholders.length).toBeGreaterThan(0);
            });
        });

        test('должен показывать сообщение, когда нет мероприятий', async () => {
            // Пустой список событий
            renderComponent(mockUserData, []);

            await waitFor(() => {
                expect(screen.getByText('Мероприятий пока нет')).toBeInTheDocument();
            });
        });
    });

    describe('Фильтрация по городу', () => {
        test('должен отображать селектор города', async () => {
            renderComponent();

            await waitFor(() => {
                // Проверяем наличие города по умолчанию (может появляться в нескольких местах)
                const cityElements = screen.getAllByText('Санкт-Петербург');
                expect(cityElements.length).toBeGreaterThan(0);
            });
        });

        test('должен фильтровать мероприятия по выбранному городу', async () => {
            renderComponent(mockUserData, mockEventsWithImages, mockCityList, 'spb');

            await waitFor(() => {
                // Все моковые события относятся к ресторану в СПб (id: 4)
                const eventCards = screen.getAllByTestId('event-card');
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Фильтрация по ресторану', () => {
        test('должен отображать селектор ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Выберите ресторан')).toBeInTheDocument();
            });
        });

        test('должен открывать селектор ресторанов при клике', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Выберите ресторан')).toBeInTheDocument();
            });

            const restaurantSelector = screen.getByText('Выберите ресторан');
            fireEvent.click(restaurantSelector);

            // Проверяем, что селектор открылся (RestaurantsListSelector должен быть видим)
            await waitFor(() => {
                // Ресторан из списка должен быть виден (может появляться в нескольких местах)
                const restaurantElements = screen.getAllByText('Self Edge Japanese');
                expect(restaurantElements.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Навигация', () => {
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

    describe('URL параметры', () => {
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
                // "Москва" может появляться в нескольких местах (селектор города, список городов)
                const moscowElements = screen.getAllByText('Москва');
                expect(moscowElements.length).toBeGreaterThan(0);
            });
        });

        test('должен устанавливать ресторан из URL параметров', async () => {
            renderComponent(
                mockUserData,
                mockEventsWithImages,
                mockCityList,
                'spb',
                mockRestaurants,
                '/events?restaurant=4'
            );

            await waitFor(() => {
                // Проверяем, что ресторан выбран (название отображается вместо "Выберите ресторан")
                // Текст "Self Edge Japanese" может появляться в нескольких местах
                const restaurantElements = screen.getAllByText(/Self Edge Japanese/);
                expect(restaurantElements.length).toBeGreaterThan(0);
                // Проверяем, что "Выберите ресторан" больше не отображается
                expect(screen.queryByText('Выберите ресторан')).not.toBeInTheDocument();
            });
        });
    });

    describe('Отображение мероприятий с tickets_left > 0', () => {
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
                // Проверяем, что sold out мероприятие не отображается
                expect(screen.queryByText('Sold Out Event')).not.toBeInTheDocument();
                // Но остальные мероприятия отображаются
                expect(eventCards.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Информация о мероприятии', () => {
        test('должен отображать название мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(mockEventsWithImages[0].name)).toBeInTheDocument();
            });
        });

        test('должен отображать название ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                // Может быть несколько карточек с одинаковым рестораном
                const restaurantElements = screen.getAllByTestId('event-restaurant-title');
                expect(restaurantElements.length).toBeGreaterThan(0);
                expect(restaurantElements[0]).toHaveTextContent(mockEventsWithImages[0].restaurant.title);
            });
        });

        test('должен отображать дату мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Дата в формате DD.MM.YYYY (может быть несколько карточек с одинаковой датой)
                const dateElements = screen.getAllByTestId('event-date');
                expect(dateElements.length).toBeGreaterThan(0);
                expect(dateElements[0]).toHaveTextContent('23.08.2025');
            });
        });
    });
});

