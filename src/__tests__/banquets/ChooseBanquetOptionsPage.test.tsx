/**
 * @fileoverview Тесты для страницы выбора опций банкета ChooseBanquetOptionsPage.
 * 
 * Страница отображает список доступных банкетных опций ресторана:
 * - Карусель изображений для каждой опции (Swiper)
 * - Информация о вместимости и депозите
 * - Описание опции с возможностью раскрытия
 * - Кнопка выбора опции для перехода к настройке
 * 
 * Особенности логики:
 * - Опции загружаются из restaurant.banquets.banquet_options
 * - Длинные описания (> 60 символов) обрезаются с кнопкой "Читать больше"
 * - При клике на изображение открывается галерея
 * - При отсутствии опций показывается сообщение "Нет доступных опций"
 * 
 * @module __tests__/banquets/ChooseBanquetOptionsPage
 * 
 * @see {@link ChooseBanquetOptionsPage} - тестируемый компонент
 * @see {@link BanquetAddressPage} - предыдущий шаг (навигация назад)
 * @see {@link BanquetOptionPage} - следующий шаг (настройка опции)
 * @see {@link BanquetGallery} - компонент галереи изображений
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChooseBanquetOptionsPage } from '@/pages/ChooseBanquetOptionsPage/ChooseBanquetOptionsPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { 
    banquetData, 
    mockBanquetOptionLongDescription, 
    mockBanquetOptionShortDescription, 
    mockBanquetOptionNoDeposit, 
    mockBanquetOptionFreeDeposit 
} from '@/__mocks__/banquets.mock.ts';
import { mockRestaurantWithoutBanquets } from '@/__mocks__/restaurant.mock.ts';
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
 */
jest.mock('@/components/Page.tsx', () => ({
    Page: ({ children, back, className }: { children: React.ReactNode; back?: boolean; className?: string }) => (
        <div data-testid="page" data-back={back} className={className}>
            {children}
        </div>
    ),
}));

/**
 * Мок компонента PageContainer.
 */
jest.mock('@/components/PageContainer/PageContainer.tsx', () => ({
    PageContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="page-container" className={className}>
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
 * Мок компонента UniversalButton.
 */
jest.mock('@/components/Buttons/UniversalButton/UniversalButton.tsx', () => ({
    UniversalButton: ({ 
        title, 
        action, 
        theme, 
        width 
    }: { 
        title: string; 
        action?: () => void; 
        theme?: string; 
        width?: string 
    }) => (
        <button 
            onClick={action} 
            data-testid="select-option-button"
            data-theme={theme}
            data-width={width}
        >
            {title}
        </button>
    ),
}));

/**
 * Мок компонента BanquetGallery.
 * Отображает упрощённую версию галереи для тестирования.
 */
jest.mock('@/components/BanquetGallery/BanquetGallery.tsx', () => ({
    __esModule: true,
    default: ({ 
        isOpen, 
        setOpen, 
        images, 
        currentIndex 
    }: { 
        isOpen: boolean; 
        setOpen: (v: boolean) => void; 
        images: string[]; 
        currentIndex: number 
    }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="banquet-gallery">
                <span data-testid="gallery-images-count">{images.length}</span>
                <span data-testid="gallery-current-index">{currentIndex}</span>
                <button onClick={() => setOpen(false)} data-testid="close-gallery">
                    Закрыть
                </button>
            </div>
        );
    },
}));

// ============================================
// Тестовые данные
// ============================================

/**
 * Моковый ресторан с кастомными банкетными опциями для тестов.
 */
const mockRestaurantWithBanquets: IRestaurant = {
    id: '1',
    title: 'Test Restaurant',
    slogan: 'Test Slogan',
    address: 'Test Address, 123',
    address_lonlng: '30.3158,59.9386',
    address_station: 'Невский проспект',
    address_station_color: '#0066cc',
    logo_url: 'https://example.com/logo.jpg',
    thumbnail_photo: 'https://example.com/thumbnail.jpg',
    openTime: '12:00',
    avg_cheque: 2500,
    photo_cards: [],
    brand_chef: {
        names: ['Шеф Повар'],
        avatars: ['https://example.com/chef.jpg'],
        about: 'Описание шефа',
        photo_url: 'https://example.com/chef.jpg',
    },
    city: {
        id: 2,
        name: 'Санкт-Петербург',
        name_english: 'spb',
        name_dative: 'Санкт-Петербурге',
    },
    banquets: {
        banquet_options: [
            mockBanquetOptionLongDescription,
            mockBanquetOptionShortDescription,
            mockBanquetOptionNoDeposit,
            mockBanquetOptionFreeDeposit,
        ],
        additional_options: banquetData.additional_options,
        description: 'Описание банкетов',
        image: 'https://example.com/banquet.jpg',
    },
    about_text: 'О ресторане',
    about_kitchen: 'О кухне',
    about_features: 'Особенности',
    phone_number: '+7 (999) 123-45-67',
    gallery: [],
    menu: [],
    menu_imgs: [],
    worktime: [{ weekday: 'пн-вс', time_start: '12:00', time_end: '23:00' }],
    socials: [],
};

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы выбора опций банкета.
 * 
 * Покрывает следующие сценарии:
 * - Рендеринг компонентов страницы
 * - Отображение списка банкетных опций
 * - Отображение информации об опциях (вместимость, депозит)
 * - Работа с описаниями (обрезка, раскрытие)
 * - Открытие галереи изображений
 * - Навигация назад и вперёд
 * - Обработка пустого списка опций
 */
describe('ChooseBanquetOptionsPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент ChooseBanquetOptionsPage с необходимыми провайдерами.
     * 
     * @param options - Опции рендеринга
     * @param options.restaurants - Список ресторанов
     * @param options.restaurantId - ID ресторана в URL
     * @returns Результат render() из @testing-library/react
     * 
     * @example
     * // Базовый рендер с рестораном с банкетами
     * renderComponent();
     * 
     * @example
     * // Рендер с пустым списком опций
     * renderComponent({ restaurants: [mockRestaurantWithoutBanquets], restaurantId: '2' });
     */
    const renderComponent = (options: {
        restaurants?: IRestaurant[];
        restaurantId?: string;
    } = {}) => {
        const {
            restaurants = [mockRestaurantWithBanquets],
            restaurantId = '1',
        } = options;

        const initialValues: Array<readonly [any, unknown]> = [
            [restaurantsListAtom, restaurants],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/banquets/${restaurantId}/choose`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/banquets/:restaurantId/choose" element={<ChooseBanquetOptionsPage />} />
                        <Route path="/banquets/:restaurantId/address" element={<div>Address Page</div>} />
                        <Route path="/banquets/:restaurantId/option/:optionId" element={<div>Option Page</div>} />
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
         * Проверяет рендеринг заголовка страницы.
         */
        it('должен рендерить заголовок "Подбор опций для банкета"', () => {
            renderComponent();

            expect(screen.getByText('Подбор опций для банкета')).toBeInTheDocument();
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
         * Проверяет рендеринг контейнера страницы.
         */
        it('должен рендерить контейнер страницы', () => {
            renderComponent();

            expect(screen.getByTestId('page-container')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отображение списка опций
    // ============================================

    describe('Отображение списка опций', () => {
        /**
         * Проверяет отображение всех банкетных опций.
         */
        it('должен отображать все банкетные опции', () => {
            renderComponent();

            // Проверяем названия всех опций
            expect(screen.getByText('Банкетный зал "Премиум"')).toBeInTheDocument();
            expect(screen.getByText('Зал "Камерный"')).toBeInTheDocument();
            expect(screen.getByText('Летняя терраса')).toBeInTheDocument();
            expect(screen.getByText('VIP-комната')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение карусели для каждой опции.
         */
        it('должен отображать карусель изображений для каждой опции', () => {
            renderComponent();

            const swipers = screen.getAllByTestId('swiper');
            expect(swipers).toHaveLength(4);
        });

        /**
         * Проверяет отображение слайдов с изображениями.
         */
        it('должен отображать слайды с изображениями', () => {
            renderComponent();

            const slides = screen.getAllByTestId('swiper-slide');
            // 2 + 1 + 1 + 1 = 5 изображений
            expect(slides).toHaveLength(5);
        });

        /**
         * Проверяет отображение кнопок "Выбрать" для каждой опции.
         */
        it('должен отображать кнопки "Выбрать" для каждой опции', () => {
            renderComponent();

            const selectButtons = screen.getAllByTestId('select-option-button');
            expect(selectButtons).toHaveLength(4);
            selectButtons.forEach(button => {
                expect(button).toHaveTextContent('Выбрать');
            });
        });
    });

    // ============================================
    // Тесты: Информация об опциях
    // ============================================

    describe('Информация об опциях', () => {
        /**
         * Проверяет отображение вместимости.
         * @remarks Используем getAllByText т.к. текст повторяется на каждом слайде.
         */
        it('должен отображать максимальное количество гостей', () => {
            renderComponent();

            // Первая опция имеет 2 слайда, поэтому текст повторяется
            expect(screen.getAllByText('до 50 человек').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('до 15 человек').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('до 30 человек').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('до 8 человек').length).toBeGreaterThanOrEqual(1);
        });

        /**
         * Проверяет отображение депозита с суммой.
         * @remarks Используем getAllByText т.к. текст повторяется на каждом слайде.
         */
        it('должен отображать депозит с суммой', () => {
            renderComponent();

            // Первая опция имеет 2 слайда, поэтому текст повторяется
            expect(screen.getAllByText('от 5000₽ на гостя').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('от 3000₽ на гостя').length).toBeGreaterThanOrEqual(1);
        });

        /**
         * Проверяет отображение кастомного сообщения о депозите.
         */
        it('должен отображать кастомное сообщение о депозите', () => {
            renderComponent();

            expect(screen.getByText('Депозит обсуждается индивидуально')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение "Без депозита" при отсутствии данных.
         */
        it('должен отображать "Без депозита" при отсутствии данных', () => {
            renderComponent();

            expect(screen.getByText('Без депозита')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Описания опций
    // ============================================

    describe('Описания опций', () => {
        /**
         * Проверяет отображение короткого описания полностью.
         */
        it('должен отображать короткое описание полностью', () => {
            renderComponent();

            expect(screen.getByText('Уютный зал для небольших компаний.')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение длинного описания.
         */
        it('должен отображать длинное описание', () => {
            renderComponent();

            expect(screen.getByText(/Роскошный банкетный зал/)).toBeInTheDocument();
        });

        /**
         * Проверяет наличие кнопки "Читать больше" для длинных описаний.
         */
        it('должен отображать кнопку "Читать больше" для длинных описаний', () => {
            renderComponent();

            expect(screen.getByText('Читать больше')).toBeInTheDocument();
        });

        /**
         * Проверяет переключение текста кнопки при раскрытии описания.
         */
        it('должен переключать текст кнопки на "Скрыть" при раскрытии', async () => {
            renderComponent();

            const readMoreButton = screen.getByText('Читать больше');
            fireEvent.click(readMoreButton);

            await waitFor(() => {
                expect(screen.getByText('Скрыть')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет переключение обратно на "Читать больше".
         */
        it('должен переключать текст обратно на "Читать больше" при сворачивании', async () => {
            renderComponent();

            const readMoreButton = screen.getByText('Читать больше');
            fireEvent.click(readMoreButton);

            await waitFor(() => {
                expect(screen.getByText('Скрыть')).toBeInTheDocument();
            });

            const hideButton = screen.getByText('Скрыть');
            fireEvent.click(hideButton);

            await waitFor(() => {
                expect(screen.getByText('Читать больше')).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Галерея изображений
    // ============================================

    describe('Галерея изображений', () => {
        /**
         * Проверяет, что галерея скрыта по умолчанию.
         */
        it('не должен отображать галерею по умолчанию', () => {
            renderComponent();

            expect(screen.queryByTestId('banquet-gallery')).not.toBeInTheDocument();
        });

        /**
         * Проверяет открытие галереи при клике на изображение.
         */
        it('должен открывать галерею при клике на изображение', async () => {
            renderComponent();

            const slides = screen.getAllByTestId('swiper-slide');
            fireEvent.click(slides[0]);

            await waitFor(() => {
                expect(screen.getByTestId('banquet-gallery')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет передачу корректного индекса в галерею.
         */
        it('должен передавать корректный индекс изображения в галерею', async () => {
            renderComponent();

            const slides = screen.getAllByTestId('swiper-slide');
            // Кликаем на второй слайд первой опции
            fireEvent.click(slides[1]);

            await waitFor(() => {
                expect(screen.getByTestId('gallery-current-index')).toHaveTextContent('1');
            });
        });

        /**
         * Проверяет передачу корректного количества изображений в галерею.
         */
        it('должен передавать корректное количество изображений в галерею', async () => {
            renderComponent();

            const slides = screen.getAllByTestId('swiper-slide');
            fireEvent.click(slides[0]);

            await waitFor(() => {
                // Первая опция имеет 2 изображения
                expect(screen.getByTestId('gallery-images-count')).toHaveTextContent('2');
            });
        });

        /**
         * Проверяет закрытие галереи.
         */
        it('должен закрывать галерею при клике на кнопку закрытия', async () => {
            renderComponent();

            const slides = screen.getAllByTestId('swiper-slide');
            fireEvent.click(slides[0]);

            await waitFor(() => {
                expect(screen.getByTestId('banquet-gallery')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('close-gallery');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByTestId('banquet-gallery')).not.toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    describe('Навигация', () => {
        /**
         * Проверяет навигацию назад на страницу выбора адреса.
         */
        it('должен навигировать назад на страницу выбора адреса', async () => {
            renderComponent();

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/address');
            });
        });

        /**
         * Проверяет навигацию на страницу опции при клике на "Выбрать".
         */
        it('должен навигировать на страницу опции при клике на "Выбрать"', async () => {
            renderComponent();

            const selectButtons = screen.getAllByTestId('select-option-button');
            fireEvent.click(selectButtons[0]);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/option/1');
            });
        });

        /**
         * Проверяет навигацию на разные опции.
         */
        it('должен навигировать на корректную опцию', async () => {
            renderComponent();

            const selectButtons = screen.getAllByTestId('select-option-button');
            
            // Клик на вторую опцию
            fireEvent.click(selectButtons[1]);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/option/2');
            });
        });
    });

    // ============================================
    // Тесты: Пустое состояние
    // ============================================

    describe('Пустое состояние', () => {
        /**
         * Проверяет отображение сообщения при отсутствии опций.
         */
        it('должен отображать сообщение "Нет доступных опций для банкета"', () => {
            renderComponent({ 
                restaurants: [mockRestaurantWithoutBanquets], 
                restaurantId: '2' 
            });

            expect(screen.getByText('Нет доступных опций для банкета')).toBeInTheDocument();
        });

        /**
         * Проверяет отсутствие карусели при пустом списке.
         */
        it('не должен отображать карусели при отсутствии опций', () => {
            renderComponent({ 
                restaurants: [mockRestaurantWithoutBanquets], 
                restaurantId: '2' 
            });

            expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
        });

        /**
         * Проверяет отсутствие кнопок "Выбрать" при пустом списке.
         */
        it('не должен отображать кнопки "Выбрать" при отсутствии опций', () => {
            renderComponent({ 
                restaurants: [mockRestaurantWithoutBanquets], 
                restaurantId: '2' 
            });

            expect(screen.queryByTestId('select-option-button')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Крайние случаи
    // ============================================

    describe('Крайние случаи', () => {
        /**
         * Проверяет корректную работу при несуществующем ресторане.
         */
        it('должен показывать пустое состояние при несуществующем ресторане', () => {
            renderComponent({ 
                restaurants: [mockRestaurantWithBanquets], 
                restaurantId: '999' 
            });

            expect(screen.getByText('Нет доступных опций для банкета')).toBeInTheDocument();
        });

        /**
         * Проверяет корректную работу при отсутствии banquets в ресторане.
         */
        it('должен корректно обрабатывать отсутствие banquets', () => {
            const restaurantWithoutBanquetsField: IRestaurant = {
                ...mockRestaurantWithBanquets,
                id: '3',
                banquets: undefined as any,
            };

            renderComponent({ 
                restaurants: [restaurantWithoutBanquetsField], 
                restaurantId: '3' 
            });

            expect(screen.getByText('Нет доступных опций для банкета')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение опции без описания.
         */
        it('должен корректно отображать опцию без описания', () => {
            renderComponent();

            // VIP-комната не имеет описания
            expect(screen.getByText('VIP-комната')).toBeInTheDocument();
            // Кнопка "Читать больше" не должна отображаться для опций без описания
            const readMoreButtons = screen.getAllByText('Читать больше');
            // Только одна кнопка для опции с длинным описанием
            expect(readMoreButtons).toHaveLength(1);
        });
    });
});
