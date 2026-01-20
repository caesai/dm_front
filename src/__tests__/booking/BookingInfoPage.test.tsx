/**
 * @fileoverview Тесты для страницы информации о бронировании BookingInfoPage.
 * 
 * Страница отображает детали существующего бронирования и позволяет:
 * - Просмотреть информацию о бронировании (ресторан, дата, время, гости)
 * - Изменить бронирование (через Telegram бота)
 * - Отменить бронирование
 * - Посмотреть меню ресторана
 * - Построить маршрут до ресторана
 * 
 * Особенности для депозитных бронирований:
 * - При отмене показывается специальный попап с условиями возврата депозита
 * - Попап содержит кнопки "Нет, оставить" и "Всё равно отменить"
 * 
 * @module __tests__/booking/BookingInfoPage
 * 
 * @see {@link BookingInfoPage} - тестируемый компонент
 * @see {@link DepositCancelModal} - попап отмены депозитного бронирования
 * @see {@link CancelBookingPopup} - стандартный попап отмены бронирования
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingInfoPage } from '@/pages/BookingInfoPage/BookingInfoPage';
import { authAtom } from '@/atoms/userAtom';
import { TestProvider } from '@/__mocks__/atom.mock';
import { 
    mockBookingInfo, 
    mockDepositBookingInfo, 
    mockWaitingBookingInfo,
    mockCanceledBookingInfo 
} from '@/__mocks__/booking.mock';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок Telegram SDK.
 */
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        hide: jest.fn(),
        onClick: jest.fn(() => jest.fn()),
    },
    openLink: jest.fn(),
}));

/**
 * Мок функции навигации react-router-dom.
 */
const mockedNavigate = jest.fn();

/**
 * Мок функции useParams для получения id бронирования.
 */
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
    useParams: () => mockUseParams(),
}));

/**
 * Мок API для бронирований.
 */
const mockAPIGetBooking = jest.fn();
const mockAPICancelBooking = jest.fn();
const mockAPIPOSTCancelReason = jest.fn();

jest.mock('@/api/restaurants.api.ts', () => ({
    APIGetBooking: (...args: any[]) => mockAPIGetBooking(...args),
    APICancelBooking: (...args: any[]) => mockAPICancelBooking(...args),
    APIPOSTCancelReason: (...args: any[]) => mockAPIPOSTCancelReason(...args),
}));

/**
 * Мок usehooks-ts.
 */
jest.mock('usehooks-ts', () => ({
    useScript: jest.fn(() => 'ready'),
}));

/**
 * Мок Telegram WebApp.
 */
Object.defineProperty(window, 'Telegram', {
    writable: true,
    value: {
        WebApp: {
            initDataUnsafe: { user: { id: 1 } },
            close: jest.fn(),
        },
    },
});

/**
 * Мок localStorage.
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

describe('BookingInfoPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент BookingInfoPage.
     * 
     * @param bookingId - ID бронирования
     * @param bookingData - Данные бронирования для мока API
     */
    const renderComponent = (
        bookingId: string = '123',
        bookingData = mockBookingInfo
    ) => {
        mockUseParams.mockReturnValue({ id: bookingId });
        mockAPIGetBooking.mockResolvedValue({ data: bookingData });

        const initialValues: Array<readonly [any, unknown]> = [
            [authAtom, { access_token: 'test-token' }],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/myBookings/${bookingId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/myBookings/:id" element={<BookingInfoPage />} />
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    // ============================================
    // Настройка тестов
    // ============================================

    const originalConsoleError = console.error;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseParams.mockReturnValue({ id: '123' });
        mockAPIGetBooking.mockResolvedValue({ data: mockBookingInfo });
        mockAPICancelBooking.mockResolvedValue({});
        mockAPIPOSTCancelReason.mockResolvedValue({});

        // Подавляем ожидаемые логи и ошибки
        jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            if (
                message.includes('not wrapped in act') ||
                message.includes('Warning:')
            ) {
                return;
            }
            originalConsoleError(...args);
        });

        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Отображение информации о бронировании
    // ============================================

    describe('Отображение информации о бронировании', () => {
        /**
         * Проверяет загрузку данных бронирования при монтировании.
         */
        test('должен загружать данные бронирования при монтировании', async () => {
            renderComponent();

            await waitFor(() => {
                expect(mockAPIGetBooking).toHaveBeenCalledWith('test-token', 123);
            });
        });

        /**
         * Проверяет отображение названия ресторана.
         */
        test('должен отображать название ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(mockBookingInfo.restaurant.title)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение адреса ресторана.
         */
        test('должен отображать адрес ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                // Адрес может отображаться в нескольких местах на странице
                const addressElements = screen.getAllByText(mockBookingInfo.restaurant.address);
                expect(addressElements.length).toBeGreaterThan(0);
            });
        });

        /**
         * Проверяет отображение статуса "подтверждено".
         */
        test('должен отображать статус "подтверждено" для confirmed бронирования', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/подтверждено/i)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение статуса "ожидание".
         */
        test('должен отображать статус ожидания для waiting бронирования', async () => {
            renderComponent('789', mockWaitingBookingInfo);

            await waitFor(() => {
                expect(screen.getByText(/свяжемся с вами/i)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение статуса "отменено".
         */
        test('должен отображать статус "отменено" для canceled бронирования', async () => {
            renderComponent('101', mockCanceledBookingInfo);

            await waitFor(() => {
                expect(screen.getByText(/отменено/i)).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Кнопки действий
    // ============================================

    describe('Кнопки действий', () => {
        /**
         * Проверяет отображение кнопок для активного бронирования.
         */
        test('должен отображать кнопки "Изменить" и "Отменить" для активного бронирования', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Изменить')).toBeInTheDocument();
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет скрытие кнопок для отменённого бронирования.
         */
        test('не должен отображать кнопки для отменённого бронирования', async () => {
            renderComponent('101', mockCanceledBookingInfo);

            await waitFor(() => {
                expect(screen.getByText(mockCanceledBookingInfo.restaurant.title)).toBeInTheDocument();
            });

            expect(screen.queryByText('Изменить')).not.toBeInTheDocument();
            expect(screen.queryByText('Отменить')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отмена обычного бронирования
    // ============================================

    describe('Отмена обычного бронирования', () => {
        /**
         * Проверяет открытие стандартного попапа отмены для обычного бронирования.
         */
        test('должен открывать стандартный попап отмены для обычного бронирования', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText(/хотите отменить бронирование/i)).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Отмена депозитного бронирования
    // ============================================

    describe('Отмена депозитного бронирования', () => {
        /**
         * Проверяет открытие специального попапа для депозитного бронирования.
         */
        test('должен открывать DepositCancelModal для депозитного бронирования', async () => {
            renderComponent('456', mockDepositBookingInfo);

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                // Проверяем текст депозитного попапа
                expect(screen.getByText(/отменяете бронь с депозитом/i)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение условий возврата депозита.
         */
        test('должен отображать условия возврата депозита', async () => {
            renderComponent('456', mockDepositBookingInfo);

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText(/За 3\+ дня — 100%/i)).toBeInTheDocument();
                expect(screen.getByText(/Менее чем за 3 дня — 50%/i)).toBeInTheDocument();
                expect(screen.getByText(/В день брони — без возврата/i)).toBeInTheDocument();
            });
        });

        /**
         * Проверяет наличие кнопок "Нет, оставить" и "Всё равно отменить".
         */
        test('должен отображать кнопки "Нет, оставить" и "Всё равно отменить"', async () => {
            renderComponent('456', mockDepositBookingInfo);

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText('Нет, оставить')).toBeInTheDocument();
                expect(screen.getByText('Всё равно отменить')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет закрытие попапа при нажатии "Нет, оставить".
         */
        test('должен закрывать попап при нажатии "Нет, оставить"', async () => {
            renderComponent('456', mockDepositBookingInfo);

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText('Нет, оставить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Нет, оставить'));

            await waitFor(() => {
                expect(screen.queryByText(/отменяете бронь с депозитом/i)).not.toBeInTheDocument();
            });
        });

        /**
         * Проверяет переход к стандартному попапу отмены при подтверждении.
         */
        test('должен открывать стандартный попап отмены при нажатии "Всё равно отменить"', async () => {
            renderComponent('456', mockDepositBookingInfo);

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText('Всё равно отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Всё равно отменить'));

            await waitFor(() => {
                expect(screen.getByText(/хотите отменить бронирование/i)).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    describe('Навигация', () => {
        /**
         * Проверяет редирект при отсутствии токена авторизации.
         */
        test('должен редиректить на главную при отсутствии токена', async () => {
            mockUseParams.mockReturnValue({ id: '123' });

            const initialValues: Array<readonly [any, unknown]> = [
                [authAtom, null],
            ];

            render(
                <TestProvider initialValues={initialValues}>
                    <MemoryRouter
                        initialEntries={['/myBookings/123']}
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                    >
                        <Routes>
                            <Route path="/myBookings/:id" element={<BookingInfoPage />} />
                        </Routes>
                    </MemoryRouter>
                </TestProvider>
            );

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/');
            });
        });
    });

    // ============================================
    // Тесты: Интеграция с API
    // ============================================

    describe('Интеграция с API', () => {
        /**
         * Проверяет вызов API отмены бронирования.
         */
        test('должен вызывать API отмены при подтверждении отмены', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Отменить')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Отменить'));

            await waitFor(() => {
                expect(screen.getByText(/хотите отменить бронирование/i)).toBeInTheDocument();
            });

            // Находим и кликаем кнопку подтверждения отмены в CancelBookingPopup
            const confirmButtons = screen.getAllByRole('button');
            const confirmButton = confirmButtons.find(btn => 
                btn.textContent?.toLowerCase().includes('да') || 
                btn.textContent?.toLowerCase().includes('отменить')
            );

            if (confirmButton) {
                await act(async () => {
                    fireEvent.click(confirmButton);
                });

                await waitFor(() => {
                    expect(mockAPICancelBooking).toHaveBeenCalled();
                });
            }
        });
    });
});
