/**
 * @fileoverview Тесты для страницы уведомлений NotificationsPage.
 *
 * Страница позволяет пользователю управлять подписками на рекламные рассылки от ресторанов.
 *
 * ## Тестируемые сценарии:
 *
 * ### 1. Загрузка данных
 * - Загрузка списка подписок при монтировании компонента
 * - Отображение списка ресторанов с переключателями
 *
 * ### 2. Переключение подписки (успех)
 * - Оптимистичное обновление UI при клике на toggle
 * - Отправка запроса APIPutUserSubscriptions с новым состоянием
 *
 * ### 3. Переключение подписки (ошибка)
 * - Откат toggle в исходное состояние при ошибке запроса
 * - Отображение toast с сообщением об ошибке
 *
 * ### 4. Навигация
 * - Возврат на страницу профиля при клике на кнопку "Назад"
 *
 * @module __tests__/notifications/NotificationsPage
 *
 * @see {@link NotificationsPage} - тестируемый компонент
 * @see {@link mockSubscriptions} - моковые данные подписок
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { NotificationsPage } from '@/pages/NotificationsPage/NotificationsPage';
import { authAtom } from '@/atoms/userAtom';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom';
import { TestProvider } from '@/__mocks__/atom.mock';
import { mockRestaurantsList } from '@/__mocks__/restaurant.mock';
import { mockSubscriptions } from '@/__mocks__/user.mock';

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
}));

/**
 * Мок функции навигации react-router-dom.
 */
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок API для подписок пользователя.
 */
const mockAPIGetUserSubscriptions = jest.fn();
const mockAPIPutUserSubscriptions = jest.fn();

jest.mock('@/api/user.api.ts', () => ({
    APIGetUserSubscriptions: (...args: any[]) => mockAPIGetUserSubscriptions(...args),
    APIPutUserSubscriptions: (...args: any[]) => mockAPIPutUserSubscriptions(...args),
}));

/**
 * Мок хука useToastState.
 */
const mockShowToast = jest.fn();

jest.mock('@/hooks/useToastState.ts', () => ({
    __esModule: true,
    default: () => ({
        showToast: mockShowToast,
    }),
}));

/**
 * Мок Telegram WebApp.
 */
Object.defineProperty(window, 'Telegram', {
    writable: true,
    value: {
        WebApp: {
            initDataUnsafe: { user: { id: 1 } },
        },
    },
});

// ============================================
// Тестовый набор
// ============================================

describe('NotificationsPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент NotificationsPage с заданными параметрами.
     *
     * @param subscriptionsData - Данные подписок для мока API (по умолчанию mockSubscriptions)
     */
    const renderComponent = (subscriptionsData = mockSubscriptions) => {
        mockAPIGetUserSubscriptions.mockResolvedValue({ data: subscriptionsData });

        const initialValues: Array<readonly [any, unknown]> = [
            [authAtom, { access_token: 'test-token', expires_in: 3600 }],
            [restaurantsListAtom, mockRestaurantsList],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={['/notifications']}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <NotificationsPage />
                </MemoryRouter>
            </TestProvider>
        );
    };

    // ============================================
    // Настройка и очистка
    // ============================================

    beforeEach(() => {
        jest.clearAllMocks();
        mockAPIGetUserSubscriptions.mockResolvedValue({ data: mockSubscriptions });
        mockAPIPutUserSubscriptions.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // Тесты: Загрузка данных
    // ============================================

    describe('Загрузка данных', () => {
        /**
         * Тест: Загрузка подписок при монтировании.
         *
         * Проверяет, что при монтировании компонента вызывается API
         * для получения текущих подписок пользователя.
         */
        test('должен загружать подписки при монтировании компонента', async () => {
            renderComponent();

            await waitFor(() => {
                expect(mockAPIGetUserSubscriptions).toHaveBeenCalledWith('test-token');
            });
        });

        /**
         * Тест: Отображение заголовка страницы.
         */
        test('должен отображать заголовок "Мои уведомления"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Мои уведомления')).toBeInTheDocument();
            });
        });

        /**
         * Тест: Отображение списка ресторанов.
         *
         * Проверяет, что все рестораны из списка отображаются на странице.
         */
        test('должен отображать список ресторанов с toggle-кнопками', async () => {
            renderComponent();

            await waitFor(() => {
                // Проверяем, что оба ресторана отображаются
                expect(screen.getByText(/Test Restaurant 1/)).toBeInTheDocument();
                expect(screen.getByText(/Test Restaurant 2/)).toBeInTheDocument();
            });

            // Проверяем наличие checkbox-ов (переключателей)
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes.length).toBe(mockRestaurantsList.length);
        });

        /**
         * Тест: Корректное состояние toggle в зависимости от подписки.
         *
         * Проверяет, что toggle отображается включенным/выключенным
         * в соответствии с данными подписки.
         */
        test('должен отображать корректное состояние toggle для каждого ресторана', async () => {
            renderComponent();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                // Первый ресторан (id: '1') — подписка включена (mockSubscriptions['1'] = true)
                expect(checkboxes[0]).toBeChecked();
                // Второй ресторан (id: '2') — подписка выключена (mockSubscriptions['2'] = false)
                expect(checkboxes[1]).not.toBeChecked();
            });
        });
    });

    // ============================================
    // Тесты: Переключение подписки (успех)
    // ============================================

    describe('Переключение подписки (успех)', () => {
        /**
         * Тест: Оптимистичное обновление UI при включении подписки.
         *
         * Проверяет, что toggle переключается сразу (до ответа API).
         */
        test('должен оптимистично обновлять UI при включении подписки', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Второй ресторан выключен — кликаем для включения
            expect(checkboxes[1]).not.toBeChecked();

            await act(async () => {
                fireEvent.click(checkboxes[1]);
            });

            // Toggle должен сразу переключиться (оптимистичное обновление)
            await waitFor(() => {
                expect(checkboxes[1]).toBeChecked();
            });
        });

        /**
         * Тест: Отправка запроса на сервер при переключении.
         *
         * Проверяет, что при клике на toggle отправляется запрос
         * APIPutUserSubscriptions с обновленными данными.
         */
        test('должен отправлять запрос APIPutUserSubscriptions при переключении', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');

            await act(async () => {
                fireEvent.click(checkboxes[1]); // Включаем подписку для второго ресторана
            });

            await waitFor(() => {
                expect(mockAPIPutUserSubscriptions).toHaveBeenCalledWith('test-token', {
                    '1': true,
                    '2': true, // Было false, стало true
                });
            });
        });

        /**
         * Тест: Отправка запроса при выключении подписки.
         */
        test('должен отправлять запрос при выключении подписки', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');

            await act(async () => {
                fireEvent.click(checkboxes[0]); // Выключаем подписку для первого ресторана
            });

            await waitFor(() => {
                expect(mockAPIPutUserSubscriptions).toHaveBeenCalledWith('test-token', {
                    '1': false, // Было true, стало false
                    '2': false,
                });
            });
        });
    });

    // ============================================
    // Тесты: Переключение подписки (ошибка)
    // ============================================

    describe('Переключение подписки (ошибка)', () => {
        /**
         * Тест: Откат toggle при ошибке запроса.
         *
         * Проверяет, что при ошибке API toggle возвращается
         * в исходное состояние.
         */
        test('должен откатывать toggle при ошибке запроса', async () => {
            mockAPIPutUserSubscriptions.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Второй ресторан выключен
            expect(checkboxes[1]).not.toBeChecked();

            await act(async () => {
                fireEvent.click(checkboxes[1]); // Пытаемся включить
            });

            // После ошибки toggle должен вернуться в исходное состояние (выключен)
            await waitFor(() => {
                expect(checkboxes[1]).not.toBeChecked();
            });
        });

        /**
         * Тест: Показ toast с сообщением об ошибке.
         *
         * Проверяет, что при ошибке API отображается toast
         * с текстом "Не удалось обновить настройку, попробуйте ещё раз."
         */
        test('должен показывать toast при ошибке запроса', async () => {
            mockAPIPutUserSubscriptions.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');

            await act(async () => {
                fireEvent.click(checkboxes[1]);
            });

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Не удалось обновить настройку, попробуйте ещё раз.'
                );
            });
        });

        /**
         * Тест: Откат toggle при выключении с ошибкой.
         */
        test('должен откатывать toggle при ошибке выключения подписки', async () => {
            mockAPIPutUserSubscriptions.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Первый ресторан включен
            expect(checkboxes[0]).toBeChecked();

            await act(async () => {
                fireEvent.click(checkboxes[0]); // Пытаемся выключить
            });

            // После ошибки toggle должен вернуться в исходное состояние (включен)
            await waitFor(() => {
                expect(checkboxes[0]).toBeChecked();
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    describe('Навигация', () => {
        /**
         * Тест: Возврат на страницу профиля.
         *
         * Проверяет, что при клике на кнопку "Назад" происходит
         * переход на страницу /profile.
         */
        test('должен возвращать на страницу профиля при клике на "Назад"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Мои уведомления')).toBeInTheDocument();
            });

            // Находим кнопку назад по классу rounded_button (RoundedButton использует div)
            const backButton = document.querySelector('.rounded_button');
            expect(backButton).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(backButton!);
            });

            expect(mockedNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    // ============================================
    // Тесты: Блокировка во время запроса
    // ============================================

    describe('Блокировка во время запроса', () => {
        /**
         * Тест: Toggle блокируется во время запроса.
         *
         * Проверяет, что повторный клик на toggle игнорируется,
         * пока выполняется предыдущий запрос.
         */
        test('должен блокировать toggle во время выполнения запроса', async () => {
            // Делаем запрос медленным
            mockAPIPutUserSubscriptions.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
            );

            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBe(2);
            });

            const checkboxes = screen.getAllByRole('checkbox');

            // Первый клик
            await act(async () => {
                fireEvent.click(checkboxes[1]);
            });

            // Проверяем, что checkbox заблокирован (disabled)
            expect(checkboxes[1]).toBeDisabled();

            // Ждем завершения запроса
            await waitFor(() => {
                expect(checkboxes[1]).not.toBeDisabled();
            });
        });
    });
});
