/**
 * @fileoverview Тесты для страницы выбора дополнительных услуг BanquetAdditionalServicesPage.
 * 
 * Страница позволяет выбрать дополнительные услуги для банкета:
 * - Отображение списка доступных услуг в виде чекбоксов
 * - Выбор/отмена услуг через toggle
 * - Переход на страницу бронирования
 * 
 * Особенности логики:
 * - Данные загружаются из banquetFormAtom через useBanquetForm hook
 * - При отсутствии дополнительных услуг автоматический редирект на резервацию
 * - Выбранные услуги сохраняются в form.selectedServices
 * - При переходе далее устанавливается withAdditionalPage: true
 * 
 * @module __tests__/banquets/BanquetAdditionalServicesPage
 * 
 * @see {@link BanquetAdditionalServicesPage} - тестируемый компонент
 * @see {@link BanquetOptionPage} - предыдущий шаг (настройка банкета)
 * @see {@link BanquetReservationPage} - следующий шаг (подтверждение)
 * @see {@link useBanquetForm} - хук управления данными банкета
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BanquetAdditionalServicesPage } from '@/pages/BanquetAdditionalServices/BanquetAdditionalServicesPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок функции navigate из react-router-dom.
 */
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок хука useBanquetForm.
 * Позволяет контролировать данные формы и обработчики в тестах.
 */
const mockToggleService = jest.fn();
const mockUpdateField = jest.fn();
const mockNavigateToReservation = jest.fn();

const mockFormWithOptions = {
    additionalOptions: [
        { id: 1, name: 'Цветочное оформление' },
        { id: 2, name: 'Разработка персонального меню' },
        { id: 3, name: 'Торт по индивидуальному заказу' },
        { id: 4, name: 'Медиаоборудование (проектор / плазма)' },
        { id: 5, name: 'Фотограф' },
    ],
    selectedServices: [] as string[],
    restaurantId: '1',
    optionId: '14',
};

let mockForm = { ...mockFormWithOptions };

jest.mock('@/hooks/useBanquetForm.ts', () => ({
    useBanquetForm: () => ({
        form: mockForm,
        handlers: {
            toggleService: mockToggleService,
            updateField: mockUpdateField,
        },
        navigateToReservation: mockNavigateToReservation,
    }),
}));

/**
 * Мок Telegram SDK.
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
    Page: ({ children, back }: { children: React.ReactNode; back?: boolean }) => (
        <div data-testid="page" data-back={back}>
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
 * Мок компонента BanquetCheckbox.
 */
jest.mock('@/components/BanquetCheckbox/BanquetCheckbox.tsx', () => ({
    BanquetCheckbox: ({ 
        checked, 
        toggle, 
        label 
    }: { 
        checked: boolean; 
        toggle: () => void; 
        label: string 
    }) => (
        <div data-testid="banquet-checkbox" data-checked={checked} onClick={toggle}>
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={toggle}
                data-testid={`checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <label>{label}</label>
        </div>
    ),
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
            data-testid="continue-button"
            data-theme={theme}
            data-width={width}
        >
            {title}
        </button>
    ),
}));

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы выбора дополнительных услуг.
 * 
 * Покрывает следующие сценарии:
 * - Рендеринг компонентов страницы
 * - Отображение списка услуг
 * - Выбор/отмена услуг
 * - Навигация (назад и вперёд)
 * - Автоматический редирект при отсутствии услуг
 * - Интеграция с useBanquetForm
 */
describe('BanquetAdditionalServicesPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент BanquetAdditionalServicesPage с необходимыми провайдерами.
     * 
     * @param options - Опции рендеринга
     * @param options.restaurantId - ID ресторана в URL
     * @param options.optionId - ID банкетной опции в URL
     * @returns Результат render() из @testing-library/react
     */
    const renderComponent = (options: {
        restaurantId?: string;
        optionId?: string;
    } = {}) => {
        const {
            restaurantId = '1',
            optionId = '14',
        } = options;

        return render(
            <TestProvider initialValues={[]}>
                <MemoryRouter
                    initialEntries={[`/banquets/${restaurantId}/additional-services/${optionId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/banquets/:restaurantId/additional-services/:optionId" element={<BanquetAdditionalServicesPage />} />
                        <Route path="/banquets/:restaurantId/option/:optionId" element={<div>Option Page</div>} />
                        <Route path="/banquets/:restaurantId/reservation" element={<div>Reservation Page</div>} />
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    // ============================================
    // Настройка тестов
    // ============================================

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock form to default state with options
        mockForm = { ...mockFormWithOptions, selectedServices: [] };

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
         * Проверяет базовый рендеринг страницы.
         */
        it('должен рендерить страницу с компонентом Page', () => {
            renderComponent();

            const page = screen.getByTestId('page');
            expect(page).toBeInTheDocument();
            expect(page).toHaveAttribute('data-back', 'true');
        });

        /**
         * Проверяет рендеринг заголовка.
         */
        it('должен рендерить заголовок "Дополнительные услуги"', () => {
            renderComponent();

            expect(screen.getByText('Дополнительные услуги')).toBeInTheDocument();
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
         * Проверяет рендеринг кнопки "Продолжить".
         */
        it('должен рендерить кнопку "Продолжить"', () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            expect(continueButton).toBeInTheDocument();
            expect(continueButton).toHaveTextContent('Продолжить');
            expect(continueButton).toHaveAttribute('data-theme', 'red');
        });

        /**
         * Проверяет рендеринг информационного текста.
         */
        it('должен рендерить информационный текст о стоимости', () => {
            renderComponent();

            expect(screen.getByText('Не входит в стоимость, оплачивается отдельно')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отображение списка услуг
    // ============================================

    describe('Отображение списка услуг', () => {
        /**
         * Проверяет отображение всех доступных услуг.
         */
        it('должен отображать все дополнительные услуги', () => {
            renderComponent();

            expect(screen.getByText('Цветочное оформление')).toBeInTheDocument();
            expect(screen.getByText('Разработка персонального меню')).toBeInTheDocument();
            expect(screen.getByText('Торт по индивидуальному заказу')).toBeInTheDocument();
            expect(screen.getByText('Медиаоборудование (проектор / плазма)')).toBeInTheDocument();
            expect(screen.getByText('Фотограф')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение чекбоксов для каждой услуги.
         */
        it('должен отображать чекбокс для каждой услуги', () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            expect(checkboxes).toHaveLength(5);
        });

        /**
         * Проверяет, что чекбоксы не выбраны по умолчанию.
         */
        it('должен показывать чекбоксы как не выбранные по умолчанию', () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            checkboxes.forEach(checkbox => {
                expect(checkbox).toHaveAttribute('data-checked', 'false');
            });
        });

        /**
         * Проверяет отображение выбранных услуг.
         */
        it('должен показывать выбранные услуги как отмеченные', () => {
            mockForm = { 
                ...mockFormWithOptions, 
                selectedServices: ['Цветочное оформление', 'Фотограф'] 
            };
            
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            // Первый и последний должны быть отмечены
            expect(checkboxes[0]).toHaveAttribute('data-checked', 'true');
            expect(checkboxes[4]).toHaveAttribute('data-checked', 'true');
            // Остальные не отмечены
            expect(checkboxes[1]).toHaveAttribute('data-checked', 'false');
            expect(checkboxes[2]).toHaveAttribute('data-checked', 'false');
            expect(checkboxes[3]).toHaveAttribute('data-checked', 'false');
        });
    });

    // ============================================
    // Тесты: Выбор услуг
    // ============================================

    describe('Выбор услуг', () => {
        /**
         * Проверяет вызов toggleService при клике на чекбокс.
         */
        it('должен вызывать toggleService при клике на чекбокс', async () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            fireEvent.click(checkboxes[0]);

            await waitFor(() => {
                expect(mockToggleService).toHaveBeenCalledWith('Цветочное оформление');
            });
        });

        /**
         * Проверяет вызов toggleService для разных услуг.
         */
        it('должен вызывать toggleService с правильным названием услуги', async () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            
            fireEvent.click(checkboxes[2]);

            await waitFor(() => {
                expect(mockToggleService).toHaveBeenCalledWith('Торт по индивидуальному заказу');
            });
        });

        /**
         * Проверяет множественный выбор услуг.
         */
        it('должен позволять выбирать несколько услуг', async () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            
            fireEvent.click(checkboxes[0]);
            fireEvent.click(checkboxes[1]);
            fireEvent.click(checkboxes[4]);

            await waitFor(() => {
                expect(mockToggleService).toHaveBeenCalledTimes(3);
                expect(mockToggleService).toHaveBeenCalledWith('Цветочное оформление');
                expect(mockToggleService).toHaveBeenCalledWith('Разработка персонального меню');
                expect(mockToggleService).toHaveBeenCalledWith('Фотограф');
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    describe('Навигация', () => {
        /**
         * Проверяет навигацию назад на страницу настройки опции.
         */
        it('должен навигировать назад на страницу настройки опции', async () => {
            renderComponent();

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/option/14');
            });
        });

        /**
         * Проверяет навигацию вперёд на страницу бронирования.
         */
        it('должен навигировать на страницу бронирования при клике "Продолжить"', async () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(mockUpdateField).toHaveBeenCalledWith({ withAdditionalPage: true });
                expect(mockNavigateToReservation).toHaveBeenCalled();
            });
        });

        /**
         * Проверяет установку withAdditionalPage при переходе.
         */
        it('должен устанавливать withAdditionalPage: true при переходе', async () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(mockUpdateField).toHaveBeenCalledWith({ withAdditionalPage: true });
            });
        });
    });

    // ============================================
    // Тесты: Автоматический редирект
    // ============================================

    describe('Автоматический редирект', () => {
        /**
         * Проверяет редирект при отсутствии дополнительных услуг.
         */
        it('должен редиректить на резервацию при пустом списке услуг', async () => {
            mockForm = { 
                ...mockFormWithOptions, 
                additionalOptions: [],
                selectedServices: [] 
            };
            
            renderComponent();

            await waitFor(() => {
                expect(mockNavigateToReservation).toHaveBeenCalled();
            });
        });

        /**
         * Проверяет редирект при undefined additionalOptions.
         */
        it('должен редиректить при undefined additionalOptions', async () => {
            mockForm = { 
                ...mockFormWithOptions, 
                additionalOptions: undefined as any,
                selectedServices: [] 
            };
            
            renderComponent();

            await waitFor(() => {
                expect(mockNavigateToReservation).toHaveBeenCalled();
            });
        });
    });

    // ============================================
    // Тесты: URL параметры
    // ============================================

    describe('URL параметры', () => {
        /**
         * Проверяет использование restaurantId из URL для навигации назад.
         */
        it('должен использовать restaurantId из URL для навигации назад', async () => {
            renderComponent({ restaurantId: '42', optionId: '15' });

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/42/option/15');
            });
        });
    });

    // ============================================
    // Тесты: Интеграция с useBanquetForm
    // ============================================

    describe('Интеграция с useBanquetForm', () => {
        /**
         * Проверяет использование form.additionalOptions.
         */
        it('должен использовать form.additionalOptions для отображения услуг', () => {
            renderComponent();

            // Проверяем что все услуги из mock отображаются
            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            expect(checkboxes).toHaveLength(mockFormWithOptions.additionalOptions.length);
        });

        /**
         * Проверяет использование form.selectedServices.
         */
        it('должен использовать form.selectedServices для отметки выбранных', () => {
            mockForm = { 
                ...mockFormWithOptions, 
                selectedServices: ['Фотограф'] 
            };
            
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            // Только последний (Фотограф) должен быть отмечен
            expect(checkboxes[4]).toHaveAttribute('data-checked', 'true');
        });

        /**
         * Проверяет использование handlers.toggleService.
         */
        it('должен использовать handlers.toggleService для переключения', async () => {
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            fireEvent.click(checkboxes[3]);

            await waitFor(() => {
                expect(mockToggleService).toHaveBeenCalledWith('Медиаоборудование (проектор / плазма)');
            });
        });

        /**
         * Проверяет использование navigateToReservation.
         */
        it('должен использовать navigateToReservation для перехода', async () => {
            renderComponent();

            const continueButton = screen.getByTestId('continue-button');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(mockNavigateToReservation).toHaveBeenCalled();
            });
        });
    });

    // ============================================
    // Тесты: Крайние случаи
    // ============================================

    describe('Крайние случаи', () => {
        /**
         * Проверяет работу с одной услугой.
         */
        it('должен корректно работать с одной услугой', () => {
            mockForm = { 
                ...mockFormWithOptions, 
                additionalOptions: [{ id: 1, name: 'Единственная услуга' }],
                selectedServices: [] 
            };
            
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            expect(checkboxes).toHaveLength(1);
            expect(screen.getByText('Единственная услуга')).toBeInTheDocument();
        });

        /**
         * Проверяет работу со всеми выбранными услугами.
         */
        it('должен корректно отображать когда все услуги выбраны', () => {
            mockForm = { 
                ...mockFormWithOptions, 
                selectedServices: [
                    'Цветочное оформление',
                    'Разработка персонального меню',
                    'Торт по индивидуальному заказу',
                    'Медиаоборудование (проектор / плазма)',
                    'Фотограф',
                ] 
            };
            
            renderComponent();

            const checkboxes = screen.getAllByTestId('banquet-checkbox');
            checkboxes.forEach(checkbox => {
                expect(checkbox).toHaveAttribute('data-checked', 'true');
            });
        });
    });
});
