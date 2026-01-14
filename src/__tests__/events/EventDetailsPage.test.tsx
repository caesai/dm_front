/**
 * @fileoverview Тесты для страницы деталей мероприятия EventDetailsPage.
 * 
 * Страница отображает подробную информацию о мероприятии:
 * - Название, описание, дата и время
 * - Цена билета (для платных мероприятий)
 * - Количество оставшихся мест
 * - Счётчик выбора количества гостей
 * - Кнопка перехода к бронированию/покупке
 * 
 * @module __tests__/events/EventDetailsPage
 * 
 * @see {@link EventDetailsPage} - тестируемый компонент
 * @see {@link EventBookingPage} - страница бронирования бесплатного мероприятия
 * @see {@link EventPurchasePage} - страница покупки билета на платное мероприятие
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EventDetailsPage } from '@/pages/EventsPage/EventDetailsPage';
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockEventsWithImages, freeEvent as baseFreeEvent, paidEvent as basePaidEvent } from '@/__mocks__/events.mock';
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

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы деталей мероприятия.
 * 
 * Покрывает следующие сценарии:
 * - Состояние загрузки (skeleton)
 * - Отображение информации о платных мероприятиях
 * - Отображение информации о бесплатных мероприятиях
 * - Работа счётчика гостей
 * - Функционал "Читать больше"
 * - Навигация на страницы бронирования/покупки
 * - Скрытие кнопки при отсутствии мест
 * - Форматирование даты и времени
 */
describe('EventDetailsPage', () => {
    // ============================================
    // Тестовые данные
    // ============================================

    /**
     * Платное мероприятие для тестов.
     * Важно: компонент показывает skeleton если нет image_url.
     */
    const paidEvent: IEvent = {
        ...basePaidEvent,
        image_url: 'https://example.com/event-image.jpg',
    };

    /**
     * Бесплатное мероприятие для тестов (ticket_price === 0).
     */
    const freeEvent: IEvent = {
        ...baseFreeEvent,
        image_url: 'https://example.com/free-event-image.jpg',
    };

    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент EventDetailsPage с необходимыми провайдерами.
     * 
     * @param user - Данные пользователя (по умолчанию mockUserData)
     * @param events - Список мероприятий (по умолчанию mockEventsWithImages)
     * @param eventId - ID мероприятия для отображения
     * @param initialGuestCount - Начальное количество гостей в атоме
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Рендер с платным мероприятием
     * renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);
     * 
     * @example
     * // Рендер с бесплатным мероприятием
     * renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id), 2);
     * 
     * @example
     * // Рендер без onboarding
     * renderComponent({ ...mockUserData, complete_onboarding: false });
     */
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
                        <Route path="/events/:eventId" element={<EventDetailsPage />} />
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
        mockUseParams.mockReturnValue({ eventId: String(paidEvent.id) });
        
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
    // Тесты: Состояние загрузки
    // ============================================

    /**
     * Тесты отображения skeleton-placeholder при загрузке данных.
     */
    describe('Состояние загрузки', () => {
        /**
         * Проверяет отображение placeholder при отсутствии данных о мероприятии.
         * Компонент должен показывать skeleton, пока данные не загружены.
         */
        test('должен показывать placeholder при отсутствии данных о мероприятии', async () => {
            renderComponent(mockUserData, [], '999');

            const placeholders = screen.getAllByTestId('placeholder-block');
            expect(placeholders.length).toBeGreaterThan(0);
        });

        /**
         * Проверяет скрытие кнопки при tickets_left = 0.
         * Кнопка "Купить билет" не должна отображаться, если места закончились.
         */
        test('не должен показывать кнопку покупки при tickets_left = 0', async () => {
            const eventWithoutTickets: IEvent[] = [{
                ...paidEvent,
                tickets_left: 0,
                image_url: 'https://example.com/event-image.jpg',
            }];

            renderComponent(mockUserData, eventWithoutTickets, String(paidEvent.id));

            await waitFor(() => {
                expect(screen.queryByText('Купить билет')).not.toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Отображение платного мероприятия
    // ============================================

    /**
     * Тесты отображения информации о платном мероприятии (ticket_price > 0).
     */
    describe('Отображение информации о платном мероприятии', () => {
        /**
         * Проверяет отображение названия мероприятия.
         */
        test('должен отображать название мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение цены билета в формате "X ₽".
         */
        test('должен отображать цену билета для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(`${paidEvent.ticket_price} ₽`)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение количества оставшихся мест.
         */
        test('должен отображать количество оставшихся мест', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(String(paidEvent.tickets_left))).toBeInTheDocument();
            });
        });

        /**
         * Проверяет наличие метки "предоплата" для платного мероприятия.
         */
        test('должен отображать метку "предоплата" для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('предоплата')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение кнопки "Купить билет" для платного мероприятия.
         */
        test('должен показывать кнопку "Купить билет" для платного мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Отображение бесплатного мероприятия
    // ============================================

    /**
     * Тесты отображения информации о бесплатном мероприятии (ticket_price === 0).
     */
    describe('Отображение информации о бесплатном мероприятии', () => {
        /**
         * Проверяет отображение кнопки "Забронировать" для бесплатного мероприятия.
         */
        test('должен показывать кнопку "Забронировать" для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText('Забронировать')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отсутствие цены для бесплатного мероприятия.
         * Блок с ценой не должен отображаться когда ticket_price === 0.
         */
        test('не должен отображать цену для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            // Цена не должна отображаться для бесплатного мероприятия
            expect(screen.queryByText('₽')).not.toBeInTheDocument();
        });

        /**
         * Проверяет отсутствие метки "предоплата" для бесплатного мероприятия.
         */
        test('не должен отображать метку "предоплата" для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            expect(screen.queryByText('предоплата')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Счётчик гостей
    // ============================================

    /**
     * Тесты работы счётчика количества гостей.
     * 
     * Логика счётчика:
     * - Минимальное значение: 0
     * - Максимальное значение: tickets_left
     * - Значение хранится в guestCountAtom
     */
    describe('Счетчик гостей', () => {
        /**
         * Проверяет увеличение счётчика при нажатии на "+".
         */
        test('должен увеличивать количество гостей при нажатии на +', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            const incrementButton = screen.getByText('+');
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByTestId('guest-count')).toHaveTextContent('2');
            });
        });

        /**
         * Проверяет уменьшение счётчика при нажатии на "-".
         */
        test('должен уменьшать количество гостей при нажатии на -', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 2);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            const decrementButton = screen.getByText('-');
            fireEvent.click(decrementButton);

            await waitFor(() => {
                expect(screen.getByTestId('guest-count')).toHaveTextContent('1');
            });
        });

        /**
         * Проверяет, что счётчик не опускается ниже 0.
         * Логика компонента: if (guestCount > 0) setGuestCount(guestCount - 1)
         */
        test('не должен уменьшать количество гостей ниже 0', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 0);

            await waitFor(() => {
                expect(screen.getByText(paidEvent.name)).toBeInTheDocument();
            });

            const decrementButton = screen.getByText('-');
            fireEvent.click(decrementButton);

            await waitFor(() => {
                // Счётчик должен остаться на 0
                expect(screen.getByTestId('guest-count')).toHaveTextContent('0');
            });
        });

        /**
         * Проверяет, что счётчик не превышает tickets_left.
         * Ограничение на максимум предотвращает бронирование больше доступных мест.
         */
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

            const incrementButton = screen.getByText('+');
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);

            await waitFor(() => {
                const countElement = screen.getByTestId('guest-count');
                expect(countElement).toHaveTextContent('2');
            });
        });
    });

    // ============================================
    // Тесты: Функция "Читать больше"
    // ============================================

    /**
     * Тесты функционала раскрытия/скрытия длинного описания.
     */
    describe('Функция "Читать больше"', () => {
        /**
         * Проверяет наличие кнопки "Читать больше" для длинного описания.
         * Кнопка показывается если description.length > 100.
         */
        test('должен показывать кнопку "Читать больше" для длинного описания', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            expect(screen.getByText('Читать больше')).toBeInTheDocument();
        });

        /**
         * Проверяет изменение текста кнопки на "Скрыть" при клике.
         */
        test('должен менять текст кнопки на "Скрыть" при клике', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id));

            await waitFor(() => {
                expect(screen.getByText(freeEvent.name)).toBeInTheDocument();
            });

            const readMoreButton = screen.getByText('Читать больше');
            fireEvent.click(readMoreButton);

            await waitFor(() => {
                expect(screen.getByText('Скрыть')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    /**
     * Тесты навигации на страницы бронирования и покупки.
     * 
     * Логика навигации:
     * - Платное мероприятие + onboarding пройден → /events/{id}/purchase
     * - Бесплатное мероприятие + onboarding пройден → /events/{id}/booking
     * - Onboarding не пройден → /onboarding/3 с state
     * - guestCount === 0 → навигация блокируется
     */
    describe('Навигация', () => {
        /**
         * Проверяет переход на страницу покупки для платного мероприятия.
         * Пользователь с complete_onboarding должен перейти на /events/{id}/purchase.
         */
        test('должен перенаправлять на страницу покупки для платного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(paidEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText('Купить билет')).toBeInTheDocument();
            });

            const buyButton = screen.getByText('Купить билет');
            fireEvent.click(buyButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(`/events/${paidEvent.id}/purchase`);
            });
        });

        /**
         * Проверяет редирект на онбординг для пользователя без complete_onboarding.
         * State должен содержать id мероприятия и флаг sharedEvent.
         */
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

        /**
         * Проверяет переход на страницу бронирования для бесплатного мероприятия.
         * Навигация на /events/{id}/booking без дополнительного state.
         */
        test('должен перенаправлять на страницу бронирования для бесплатного мероприятия', async () => {
            renderComponent(mockUserData, mockEventsWithImages, String(freeEvent.id), 1);

            await waitFor(() => {
                expect(screen.getByText('Забронировать')).toBeInTheDocument();
            });

            const bookButton = screen.getByText('Забронировать');
            fireEvent.click(bookButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith(`/events/${freeEvent.id}/booking`);
            });
        });

        /**
         * Проверяет блокировку навигации при guestCount = 0.
         * Кнопка должна быть disabled, navigate() не вызывается.
         */
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

    // ============================================
    // Тесты: Скрытие кнопки при отсутствии мест
    // ============================================

    /**
     * Тесты отображения/скрытия кнопки бронирования в зависимости от tickets_left.
     */
    describe('Скрытие кнопки при отсутствии мест', () => {
        /**
         * Проверяет скрытие кнопки, когда tickets_left = 0.
         * Если мест нет, кнопка бронирования/покупки не должна отображаться.
         */
        test('не должен показывать кнопку бронирования, если tickets_left = 0', async () => {
            const soldOutEvent: IEvent[] = [{
                ...paidEvent,
                tickets_left: 0,
                image_url: 'https://example.com/event-image.jpg',
            }];

            renderComponent(mockUserData, soldOutEvent, String(paidEvent.id));

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(screen.queryByText('Купить билет')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Форматирование даты и времени
    // ============================================

    /**
     * Тесты правильного форматирования даты и времени мероприятия.
     * Использует moment.js для форматирования.
     */
    describe('Форматирование даты и времени', () => {
        /**
         * Проверяет отображение даты в формате DD.MM.YYYY.
         */
        test('должен отображать дату мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Дата в формате DD.MM.YYYY
                expect(screen.getByText('23.08.2025')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение времени в формате HH:mm.
         */
        test('должен отображать время мероприятия', async () => {
            renderComponent();

            await waitFor(() => {
                // Время в формате HH:mm
                expect(screen.getByText('15:00')).toBeInTheDocument();
            });
        });
    });
});
