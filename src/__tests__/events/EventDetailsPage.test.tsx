import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { EventDetailsPage } from '@/pages/EventsPage/EventDetailsPage/EventDetailsPage.tsx';
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockEventsList } from '@/__mocks__/events.mock';
import { IUser } from '@/types/user.types.ts';
import { IEvent, IEventBooking } from '@/types/events.types.ts';
import { useState } from 'react';

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
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
    useParams: () => mockUseParams(),
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

// Wrapper component to provide OutletContext
const OutletContextWrapper: React.FC = () => {
    const [eventBookingInfo, setEventBookingInfo] = useState<IEventBooking | null>(null);

    return (
        <Outlet context={[eventBookingInfo, setEventBookingInfo]} />
    );
};

describe('EventDetailsPage', () => {
    // Мероприятие с платным билетом (ticket_price > 0) и заполненным image_url
    // Важно: компонент показывает skeleton если нет image_url
    const paidEvent: IEvent = {
        ...mockEventsList.find(e => e.ticket_price > 0)!,
        image_url: 'https://example.com/event-image.jpg',
    };
    // Бесплатное мероприятие (ticket_price === 0) с заполненным image_url
    const freeEvent: IEvent = {
        ...mockEventsList.find(e => e.ticket_price === 0)!,
        image_url: 'https://example.com/free-event-image.jpg',
    };
    
    // Список событий с заполненными image_url для тестов
    const mockEventsWithImages: IEvent[] = mockEventsList.map(e => ({
        ...e,
        image_url: e.image_url || 'https://example.com/default-event-image.jpg',
    }));

    const renderComponent = (
        user: IUser | undefined = mockUserData,
        events: IEvent[] | null = mockEventsWithImages,
        eventId: string = String(paidEvent.id),
        initialGuestCount: number = 1
    ) => {
        mockUseParams.mockReturnValue({ eventId });

        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [eventsListAtom, events],
            [guestCountAtom, initialGuestCount],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/events/${eventId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route element={<OutletContextWrapper />}>
                            <Route path="/events/:eventId" element={<EventDetailsPage />} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseParams.mockReturnValue({ eventId: String(paidEvent.id) });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Состояние загрузки', () => {
        test('должен показывать placeholder при отсутствии данных о мероприятии', async () => {
            // Рендерим без данных о мероприятии (пустой список)
            renderComponent(mockUserData, [], '999');

            // Проверяем наличие placeholder блоков
            const placeholders = screen.getAllByTestId('placeholder-block');
            expect(placeholders.length).toBeGreaterThan(0);
        });

        test('должен показывать placeholder при отсутствии tickets_left', async () => {
            const eventWithoutTickets: IEvent[] = [{
                ...paidEvent,
                tickets_left: 0,
                image_url: 'https://example.com/event-image.jpg',
            }];

            renderComponent(mockUserData, eventWithoutTickets, String(paidEvent.id));

            // Компонент должен показывать placeholder, так как tickets_left = 0
            await waitFor(() => {
                // Кнопка "Купить билет" не должна отображаться, если tickets_left === 0
                expect(screen.queryByText('Купить билет')).not.toBeInTheDocument();
            });
        });
    });

    describe('Отображение информации о платном мероприятии', () => {
        test('должен отображать название мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });
        });

        test('должен отображать цену билета для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(`${paidEvent.ticket_price} ₽`)).toBeInTheDocument();
            });
        });

        test('должен отображать количество оставшихся мест', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(String(paidEvent.tickets_left))).toBeInTheDocument();
            });
        });

        test('должен отображать метку "предоплата" для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('предоплата')).toBeInTheDocument();
            });
        });

        test('должен показывать кнопку "Купить билет" для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });
        });
    });

    describe('Отображение информации о бесплатном мероприятии', () => {
        test('должен показывать кнопку "Забронировать" для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText('Забронировать')).toBeInTheDocument();
            });
        });

        test('не должен отображать цену для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            // Цена не должна отображаться для бесплатного мероприятия
            expect(screen.queryByText('₽')).not.toBeInTheDocument();
        });

        test('не должен отображать метку "предоплата" для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            expect(screen.queryByText('предоплата')).not.toBeInTheDocument();
        });
    });

    describe('Счетчик гостей', () => {
        test('должен увеличивать количество гостей при нажатии на +', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            // Находим кнопку + и кликаем
            const incrementButton = screen.getByText('+');
            fireEvent.click(incrementButton);

            await waitFor(() => {
                // Проверяем, что счетчик увеличился до 2
                expect(screen.getByTestId('guest-count')).toHaveTextContent('2');
            });
        });

        test('должен уменьшать количество гостей при нажатии на -', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 2);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            // Находим кнопку - и кликаем
            const decrementButton = screen.getByText('-');
            fireEvent.click(decrementButton);

            await waitFor(() => {
                // Проверяем, что счетчик уменьшился до 1
                expect(screen.getByTestId('guest-count')).toHaveTextContent('1');
            });
        });

        test('не должен уменьшать количество гостей ниже 1', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            // Находим кнопку - и кликаем
            const decrementButton = screen.getByText('-');
            fireEvent.click(decrementButton);

            await waitFor(() => {
                // Счетчик должен остаться на 1
                expect(screen.getByTestId('guest-count')).toHaveTextContent('1');
            });
        });

        test('не должен увеличивать количество гостей выше tickets_left', async () => {
            const limitedEvent: IEvent[] = [{
                ...paidEvent,
                tickets_left: 2,
                image_url: 'https://example.com/event-image.jpg',
            }];

            renderComponent(mockUserData, limitedEvent, String(paidEvent.id), 2);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            // Находим кнопку + и кликаем несколько раз
            const incrementButton = screen.getByText('+');
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);

            // Счетчик должен остаться на максимуме (2)
            await waitFor(() => {
                const countElement = screen.getByTestId('guest-count');
                expect(countElement).toHaveTextContent('2');
            });
        });
    });

    describe('Функция "Читать больше"', () => {
        test('должен показывать кнопку "Читать больше" для длинного описания', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            // Проверяем наличие кнопки "Читать больше"
            expect(screen.getByText('Читать больше')).toBeInTheDocument();
        });

        test('должен менять текст кнопки на "Скрыть" при клике', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            // Кликаем на кнопку "Читать больше"
            const readMoreButton = screen.getByText('Читать больше');
            fireEvent.click(readMoreButton);

            await waitFor(() => {
                expect(screen.getByText('Скрыть')).toBeInTheDocument();
            });
        });
    });

    describe('Навигация', () => {
        test('должен перенаправлять на страницу подтверждения для платного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });

            const buyButton = screen.getByText('Купить билет');
            fireEvent.click(buyButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(`/events/${paidEvent.id}/confirm`);
            });
        });

        test('должен перенаправлять на онбординг для пользователя без complete_onboarding', async () => {
            const userWithoutOnboarding: IUser = {
                ...mockUserData,
                complete_onboarding: false,
            };

            renderComponent(userWithoutOnboarding, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });

            const buyButton = screen.getByText('Купить билет');
            fireEvent.click(buyButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(
                    '/onboarding/3',
                    expect.objectContaining({
                        state: expect.objectContaining({
                            id: paidEvent.id,
                            sharedEvent: true,
                        }),
                    })
                );
            });
        });

        test('должен перенаправлять на страницу бронирования для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText('Забронировать')).toBeInTheDocument();
            });

            const bookButton = screen.getByText('Забронировать');
            fireEvent.click(bookButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(
                    `/events/${freeEvent.restaurant?.id}/booking`,
                    expect.objectContaining({
                        state: expect.objectContaining({
                            eventName: freeEvent.name,
                            eventId: freeEvent.id,
                            eventGuestCount: 1,
                        }),
                    })
                );
            });
        });

        test('не должен выполнять навигацию при guestCount = 0', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 0);

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });

            const buyButton = screen.getByText('Купить билет');
            fireEvent.click(buyButton);

            // Навигация не должна быть вызвана
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });

    describe('Скрытие кнопки при отсутствии мест', () => {
        test('не должен показывать кнопку бронирования, если tickets_left = 0', async () => {
            const soldOutEvent: IEvent[] = [{
                ...paidEvent,
                tickets_left: 0,
                image_url: 'https://example.com/event-image.jpg',
            }];

            renderComponent(mockUserData, soldOutEvent, String(paidEvent.id));

            // Ждем рендеринга
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Кнопка "Купить билет" не должна отображаться
            expect(screen.queryByText('Купить билет')).not.toBeInTheDocument();
        });
    });

    describe('Форматирование даты и времени', () => {
        test('должен отображать дату мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Дата в формате DD.MM.YYYY
                expect(screen.getByText('23.08.2025')).toBeInTheDocument();
            });
        });

        test('должен отображать время мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Время в формате HH:mm
                expect(screen.getByText('15:00')).toBeInTheDocument();
            });
        });
    });
});

