/**
 * @fileoverview Тесты для страницы выбора ресторана для банкета BanquetAddressPage.
 * 
 * Страница отображает информацию о банкетах и позволяет выбрать ресторан:
 * - Информационный блок с описанием банкетов
 * - Селектор ресторанов (только рестораны с банкетными опциями)
 * - Кнопка "Продолжить" для навигации на страницу выбора опций
 * 
 * Особенности логики:
 * - Показываются только рестораны с banquet_options.length > 0
 * - При переходе со страницы ресторана ресторан предвыбирается
 * - Навигация назад зависит от статуса онбординга пользователя
 * - Не прошедшие онбординг пользователи перенаправляются на /onboarding/3
 * 
 * @module __tests__/banquets/BanquetAddressPage
 * 
 * @see {@link BanquetAddressPage} - тестируемый компонент
 * @see {@link ChooseBanquetOptionsPage} - страница выбора опций банкета (следующий шаг)
 * @see {@link RestaurantsListSelector} - компонент выбора ресторана
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BanquetAddressPage } from '@/pages/BanquetAddressPage/BanquetAddressPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { userAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { mockUserData, mockUserNotOnboarded } from '@/__mocks__/user.mock.ts';
import { mockRestaurantWithBanquets, mockRestaurantWithoutBanquets, mockRestaurantWithBanquets2 } from '@/__mocks__/restaurant.mock.ts';
import { IUser } from '@/types/user.types.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок функции navigate из react-router-dom.
 * Позволяет проверять вызовы navigate() в тестах.
 */
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок Telegram SDK.
 * Имитирует backButton и mainButton для работы компонента Page.
 */
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        hide: jest.fn(),
        onClick: jest.fn(),
        offClick: jest.fn(),
    },
    mainButton: {
        onClick: jest.fn(),
        offClick: jest.fn(),
        setParams: jest.fn(),
        mount: {
            isAvailable: jest.fn(),
        },
        unmount: jest.fn(),
    },
}));

/**
 * Мок компонента Page.
 * Упрощённая версия для изоляции тестируемой логики.
 */
jest.mock('@/components/Page.tsx', () => ({
    Page: ({ children, back, className }: { children: React.ReactNode; back?: boolean; className?: string }) => (
        <div data-testid="page" data-back={back} className={className}>
            {children}
        </div>
    ),
}));

/**
 * Мок компонента RoundedButton.
 */
jest.mock('@/components/RoundedButton/RoundedButton.tsx', () => ({
    RoundedButton: ({ action, icon }: { action?: () => void; icon?: React.ReactNode }) => (
        <button onClick={action} data-testid="back-button">
            {icon}
        </button>
    ),
}));

/**
 * Мок иконки BackIcon.
 */
jest.mock('@/components/Icons/BackIcon.tsx', () => ({
    BackIcon: ({ color }: { color?: string }) => <span data-testid="back-icon" data-color={color}>←</span>,
}));

/**
 * Мок компонента BottomButtonWrapper.
 */
jest.mock('@/components/BottomButtonWrapper/BottomButtonWrapper.tsx', () => ({
    BottomButtonWrapper: ({ 
        content, 
        onClick, 
        isDisabled 
    }: { 
        content: string; 
        onClick: () => void; 
        isDisabled?: boolean 
    }) => (
        <button 
            onClick={onClick} 
            disabled={isDisabled} 
            data-testid="continue-button"
        >
            {content}
        </button>
    ),
}));

/**
 * Мок компонента RestaurantsListSelector.
 * Предоставляет упрощённый интерфейс для выбора ресторана.
 */
jest.mock('@/components/RestaurantsListSelector/RestaurantsListSelector.tsx', () => ({
    RestaurantsListSelector: ({ 
        onSelect, 
        filteredRestaurants, 
        selectedRestaurant 
    }: { 
        onSelect: (value: any) => void; 
        filteredRestaurants: any[]; 
        selectedRestaurant: any;
    }) => (
        <div data-testid="restaurants-list-selector">
            <span data-testid="selected-restaurant">
                {selectedRestaurant?.title !== 'unset' ? selectedRestaurant?.title : 'Не выбран'}
            </span>
            <ul data-testid="restaurants-list">
                {filteredRestaurants.map((r: any) => (
                    <li 
                        key={r.id} 
                        data-testid={`restaurant-option-${r.id}`}
                        onClick={() => onSelect({ 
                            value: String(r.id), 
                            title: r.title, 
                            subtitle: r.address 
                        })}
                    >
                        {r.title}
                    </li>
                ))}
            </ul>
        </div>
    ),
}));

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы выбора ресторана для банкета.
 * 
 * Покрывает следующие сценарии:
 * - Рендеринг компонентов страницы
 * - Фильтрация ресторанов по наличию банкетных опций
 * - Выбор ресторана
 * - Навигация вперёд (на страницу выбора опций)
 * - Навигация назад (зависит от онбординга и источника)
 * - Предвыбор ресторана из URL параметров
 * - Состояние кнопки "Продолжить"
 */
describe('BanquetAddressPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент BanquetAddressPage с необходимыми провайдерами.
     * 
     * @param options - Опции рендеринга
     * @param options.user - Данные пользователя (по умолчанию mockUserData)
     * @param options.restaurants - Список ресторанов
     * @param options.restaurantId - ID ресторана в URL (по умолчанию ':restaurantId')
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Базовый рендер
     * renderComponent();
     * 
     * @example
     * // Рендер с предвыбранным рестораном
     * renderComponent({ restaurantId: '1' });
     * 
     * @example
     * // Рендер с пользователем без онбординга
     * renderComponent({ user: mockUserNotOnboarded });
     */
    const renderComponent = (options: {
        user?: IUser | null;
        restaurants?: IRestaurant[];
        restaurantId?: string;
    } = {}) => {
        const {
            user = mockUserData,
            restaurants = [mockRestaurantWithBanquets, mockRestaurantWithoutBanquets, mockRestaurantWithBanquets2],
            restaurantId = ':restaurantId',
        } = options;

        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [restaurantsListAtom, restaurants],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/banquets/${restaurantId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/banquets/:restaurantId" element={<BanquetAddressPage />} />
                        <Route path="/banquets/:restaurantId/choose" element={<div>Choose Options Page</div>} />
                        <Route path="/restaurant/:restaurantId" element={<div>Restaurant Page</div>} />
                        <Route path="/onboarding/:step" element={<div>Onboarding Page</div>} />
                        <Route path="/" element={<div>Index Page</div>} />
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
                message.includes('Not implemented: navigation')
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
                message.includes('clip-path')
            ) {
                return;
            }
            originalConsoleWarn(...args);
        });

        // Подавляем console.log в компоненте
        jest.spyOn(console, 'log').mockImplementation(() => {});
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
         * Проверяет рендеринг заголовка "Банкеты".
         */
        it('должен рендерить заголовок "Банкеты"', () => {
            renderComponent();

            expect(screen.getByText('Банкеты')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг описания банкетов.
         */
        it('должен рендерить описание банкетов', () => {
            renderComponent();

            expect(screen.getByText(/Для тех, кто планирует важное событие/)).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг заголовка "Адрес ресторана".
         */
        it('должен рендерить заголовок "Адрес ресторана"', () => {
            renderComponent();

            expect(screen.getByText('Адрес ресторана')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг кнопки "Назад".
         */
        it('должен рендерить кнопку "Назад"', () => {
            renderComponent();

            expect(screen.getByTestId('back-button')).toBeInTheDocument();
            expect(screen.getByTestId('back-icon')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг селектора ресторанов.
         */
        it('должен рендерить селектор ресторанов', () => {
            renderComponent();

            expect(screen.getByTestId('restaurants-list-selector')).toBeInTheDocument();
        });

        /**
         * Проверяет рендеринг кнопки "Продолжить".
         */
        it('должен рендерить кнопку "Продолжить"', () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            expect(continueButton).toBeInTheDocument();
            expect(continueButton).toHaveTextContent('Продолжить');
        });
    });

    // ============================================
    // Тесты: Фильтрация ресторанов
    // ============================================

    describe('Фильтрация ресторанов', () => {
        /**
         * Проверяет, что показываются только рестораны с банкетными опциями.
         */
        it('должен показывать только рестораны с банкетными опциями', () => {
            renderComponent();

            // Ресторан с банкетами должен быть виден
            expect(screen.getByTestId('restaurant-option-1')).toBeInTheDocument();
            expect(screen.getByTestId('restaurant-option-3')).toBeInTheDocument();
            
            // Ресторан без банкетов не должен быть виден
            expect(screen.queryByTestId('restaurant-option-2')).not.toBeInTheDocument();
        });

        /**
         * Проверяет корректное количество ресторанов в списке.
         */
        it('должен показывать корректное количество ресторанов', () => {
            renderComponent();

            const restaurantsList = screen.getByTestId('restaurants-list');
            const restaurants = restaurantsList.querySelectorAll('li');
            
            // Только 2 ресторана с банкетными опциями
            expect(restaurants).toHaveLength(2);
        });
    });

    // ============================================
    // Тесты: Выбор ресторана
    // ============================================

    describe('Выбор ресторана', () => {
        /**
         * Проверяет начальное состояние - ресторан не выбран.
         */
        it('должен показывать "Не выбран" если ресторан не выбран', () => {
            renderComponent();

            expect(screen.getByTestId('selected-restaurant')).toHaveTextContent('Не выбран');
        });

        /**
         * Проверяет выбор ресторана из списка.
         */
        it('должен обновлять выбранный ресторан при клике', async () => {
            renderComponent();

            const restaurantOption = screen.getByTestId('restaurant-option-1');
            fireEvent.click(restaurantOption);

            await waitFor(() => {
                expect(screen.getByTestId('selected-restaurant')).toHaveTextContent('Test Restaurant');
            });
        });

        /**
         * Проверяет предвыбор ресторана из URL параметров.
         */
        it('должен предвыбирать ресторан из URL параметров', async () => {
            renderComponent({ restaurantId: '1' });

            await waitFor(() => {
                expect(screen.getByTestId('selected-restaurant')).toHaveTextContent('Test Restaurant');
            });
        });
    });

    // ============================================
    // Тесты: Состояние кнопки "Продолжить"
    // ============================================

    describe('Состояние кнопки "Продолжить"', () => {
        /**
         * Проверяет, что кнопка заблокирована когда ресторан не выбран.
         */
        it('должен блокировать кнопку когда ресторан не выбран', () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            expect(continueButton).toBeDisabled();
        });

        /**
         * Проверяет, что кнопка разблокирована после выбора ресторана.
         */
        it('должен разблокировать кнопку после выбора ресторана', async () => {
            renderComponent();

            const restaurantOption = screen.getByTestId('restaurant-option-1');
            fireEvent.click(restaurantOption);

            await waitFor(() => {
                const continueButton = screen.getByTestId('continue-button');
                expect(continueButton).not.toBeDisabled();
            });
        });
    });

    // ============================================
    // Тесты: Навигация вперёд
    // ============================================

    describe('Навигация вперёд', () => {
        /**
         * Проверяет навигацию на страницу выбора опций для онбордированного пользователя.
         */
        it('должен навигировать на страницу выбора опций для онбордированного пользователя', async () => {
            renderComponent();

            // Выбираем ресторан
            const restaurantOption = screen.getByTestId('restaurant-option-1');
            fireEvent.click(restaurantOption);

            await waitFor(() => {
                expect(screen.getByTestId('continue-button')).not.toBeDisabled();
            });

            // Нажимаем "Продолжить"
            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/choose');
            });
        });

        /**
         * Проверяет навигацию на онбординг для пользователя без онбординга.
         */
        it('должен навигировать на онбординг для не онбордированного пользователя', async () => {
            renderComponent({ user: mockUserNotOnboarded });

            // Выбираем ресторан
            const restaurantOption = screen.getByTestId('restaurant-option-1');
            fireEvent.click(restaurantOption);

            await waitFor(() => {
                expect(screen.getByTestId('continue-button')).not.toBeDisabled();
            });

            // Нажимаем "Продолжить"
            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/onboarding/3', {
                    state: {
                        id: '1',
                        sharedBanquet: true,
                    },
                });
            });
        });

        /**
         * Проверяет, что навигация не происходит при заблокированной кнопке.
         */
        it('не должен навигировать если кнопка заблокирована', () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // Тесты: Навигация назад
    // ============================================

    describe('Навигация назад', () => {
        /**
         * Проверяет навигацию на главную страницу при :restaurantId в URL.
         */
        it('должен навигировать на главную страницу при :restaurantId в URL', async () => {
            renderComponent();

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/');
            });
        });

        /**
         * Проверяет навигацию на страницу ресторана при конкретном restaurantId.
         */
        it('должен навигировать на страницу ресторана при конкретном restaurantId', async () => {
            renderComponent({ restaurantId: '1' });

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/restaurant/1');
            });
        });

        /**
         * Проверяет навигацию на онбординг для пользователя без онбординга.
         */
        it('должен навигировать на онбординг для не онбордированного пользователя', async () => {
            renderComponent({ user: mockUserNotOnboarded });

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/onboarding/3');
            });
        });
    });

    // ============================================
    // Тесты: Крайние случаи
    // ============================================

    describe('Крайние случаи', () => {
        /**
         * Проверяет корректную работу при пустом списке ресторанов.
         */
        it('должен корректно обрабатывать пустой список ресторанов', () => {
            renderComponent({ restaurants: [] });

            const restaurantsList = screen.getByTestId('restaurants-list');
            const restaurants = restaurantsList.querySelectorAll('li');
            
            expect(restaurants).toHaveLength(0);
        });

        /**
         * Проверяет корректную работу при отсутствии ресторанов с банкетами.
         */
        it('должен показывать пустой список если нет ресторанов с банкетами', () => {
            renderComponent({ restaurants: [mockRestaurantWithoutBanquets] });

            const restaurantsList = screen.getByTestId('restaurants-list');
            const restaurants = restaurantsList.querySelectorAll('li');
            
            expect(restaurants).toHaveLength(0);
        });

        /**
         * Проверяет корректную работу при null пользователе.
         */
        it('должен корректно обрабатывать null пользователя', () => {
            renderComponent({ user: null });

            // Страница должна рендериться
            expect(screen.getByTestId('page')).toBeInTheDocument();
        });
    });
});
