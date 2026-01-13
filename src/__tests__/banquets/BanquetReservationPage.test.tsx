/**
 * @fileoverview Тесты для страницы подтверждения бронирования банкета BanquetReservationPage.
 * 
 * Страница является финальным шагом в процессе бронирования банкета:
 * - Отображение сводки всех введённых данных
 * - Ввод комментария к бронированию
 * - Выбор способа связи (Telegram/телефон)
 * - Отображение предварительной стоимости
 * - Отправка запроса на бронирование
 * 
 * Особенности логики:
 * - Данные загружаются из banquetFormAtom через useBanquetForm hook
 * - Навигация назад зависит от withAdditionalPage флага
 * - При успешном бронировании происходит редирект на главную
 * - Форма сбрасывается после успешного бронирования
 * 
 * @module __tests__/banquets/BanquetReservationPage
 * 
 * @see {@link BanquetReservationPage} - тестируемый компонент
 * @see {@link BanquetAdditionalServicesPage} - предыдущий шаг (опционально)
 * @see {@link BanquetOptionPage} - предыдущий шаг (если нет доп. услуг)
 * @see {@link useBanquetForm} - хук управления данными банкета
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BanquetReservationPage } from '@/pages/BanquetReservationPage/BanquetReservationPage.tsx';
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
 * Мок Jotai useAtomValue для userAtom.
 */
const mockUser = {
    first_name: 'Иван',
    last_name: 'Петров',
    phone_number: '79001234567',
    complete_onboarding: true,
};

jest.mock('jotai', () => ({
    ...jest.requireActual('jotai'),
    useAtomValue: jest.fn().mockImplementation(() => {
        // Возвращаем mockUser для userAtom
        return mockUser;
    }),
}));

/**
 * Мок хука useBanquetForm.
 * Позволяет контролировать данные формы и обработчики в тестах.
 */
const mockCreateBanquetRequest = jest.fn().mockResolvedValue(true);

/**
 * Интерфейс для моковых данных формы.
 * Соответствует IBanquetFormState из banquetFormAtom.
 */
interface IMockFormData {
    name: string | undefined;
    date: Date | null;
    timeFrom: string;
    timeTo: string;
    guestCount: { value: string; title: string };
    currentRestaurant: { id: number; title: string; address: string } | undefined;
    restaurantId: string;
    optionId: string;
    reason: string;
    additionalOptions: { id: number; name: string }[];
    selectedServices: string[];
    withAdditionalPage: boolean;
    price: {
        deposit: number | null;
        totalDeposit: number;
        serviceFee: number;
        total: number;
    } | null;
}

const mockFormData: IMockFormData = {
    name: 'Банкетный зал "Премиум"',
    date: new Date('2026-02-15'),
    timeFrom: '18:00',
    timeTo: '22:00',
    guestCount: { value: '25', title: '25 человек' },
    currentRestaurant: { id: 1, title: 'Ресторан "Гурман"', address: 'ул. Ленина, 1' },
    restaurantId: '1',
    optionId: '14',
    reason: 'День рождения',
    additionalOptions: [
        { id: 1, name: 'Цветочное оформление' },
        { id: 2, name: 'Фотограф' },
    ],
    selectedServices: ['Цветочное оформление', 'Фотограф'],
    withAdditionalPage: true,
    price: {
        deposit: 3000,
        totalDeposit: 75000,
        serviceFee: 10,
        total: 82500,
    },
};

let mockForm: IMockFormData = { ...mockFormData };

jest.mock('@/hooks/useBanquetForm.ts', () => ({
    useBanquetForm: () => ({
        form: mockForm,
        createBanquetRequest: mockCreateBanquetRequest,
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
 * Мок компонента TextInput.
 */
jest.mock('@/components/TextInput/TextInput.tsx', () => ({
    TextInput: ({ 
        value, 
        onChange, 
        placeholder 
    }: { 
        value: string; 
        onChange: (value: string) => void; 
        placeholder?: string 
    }) => (
        <input
            data-testid="commentary-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    ),
}));

/**
 * Мок компонента ConfirmationSelect.
 */
jest.mock('@/components/ConfirmationSelect/ConfirmationSelect.tsx', () => ({
    ConfirmationSelect: ({ 
        options, 
        currentValue, 
        onChange, 
        title 
    }: { 
        options: { id: string; text: string }[];
        currentValue: { id: string; text: string };
        onChange: (value: { id: string; text: string }) => void;
        title?: React.ReactNode;
    }) => (
        <div data-testid="confirmation-select">
            {title}
            <select 
                data-testid="confirmation-select-dropdown"
                value={currentValue.id}
                onChange={(e) => {
                    const option = options.find(o => o.id === e.target.value);
                    if (option) onChange(option);
                }}
            >
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.text}</option>
                ))}
            </select>
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
            data-testid="submit-button"
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
 * Тесты страницы подтверждения бронирования банкета.
 * 
 * Покрывает следующие сценарии:
 * - Рендеринг компонентов страницы
 * - Отображение данных бронирования
 * - Отображение информации о пользователе
 * - Отображение дополнительных услуг
 * - Отображение стоимости
 * - Ввод комментария
 * - Выбор способа связи
 * - Навигация
 * - Отправка бронирования
 * - Крайние случаи
 */
describe('BanquetReservationPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент BanquetReservationPage с необходимыми провайдерами.
     * 
     * @param options - Опции рендеринга
     * @param options.restaurantId - ID ресторана в URL
     * @returns Результат render() из @testing-library/react
     * 
     * @remarks
     * URL имеет формат /banquets/:restaurantId/reservation (без optionId).
     * optionId берётся из formData через useBanquetForm, а не из URL.
     */
    const renderComponent = (options: {
        restaurantId?: string;
    } = {}) => {
        const {
            restaurantId = '1',
        } = options;

        return render(
            <TestProvider initialValues={[]}>
                <MemoryRouter
                    initialEntries={[`/banquets/${restaurantId}/reservation`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/banquets/:restaurantId/reservation" element={<BanquetReservationPage />} />
                        <Route path="/banquets/:restaurantId/option/:optionId" element={<div>Option Page</div>} />
                        <Route path="/banquets/:restaurantId/additional-services/:optionId" element={<div>Additional Services Page</div>} />
                        <Route path="/" element={<div>Home Page</div>} />
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
        // Reset mock form to default state
        mockForm = { ...mockFormData };

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
         * Проверяет рендеринг заголовка с названием ресторана.
         */
        it('должен рендерить заголовок с названием ресторана', () => {
            renderComponent();

            expect(screen.getByText('Ресторан "Гурман"')).toBeInTheDocument();
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
         * Проверяет рендеринг кнопки "Забронировать".
         */
        it('должен рендерить кнопку "Забронировать"', () => {
            renderComponent();

            const submitButton = screen.getByTestId('submit-button');
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toHaveTextContent('Забронировать');
            expect(submitButton).toHaveAttribute('data-theme', 'red');
        });
    });

    // ============================================
    // Тесты: Отображение данных пользователя
    // ============================================

    describe('Отображение данных пользователя', () => {
        /**
         * Проверяет отображение имени пользователя.
         */
        it('должен отображать имя пользователя', () => {
            renderComponent();

            expect(screen.getByText('Имя')).toBeInTheDocument();
            expect(screen.getByText('Иван')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение номера телефона.
         */
        it('должен отображать номер телефона с форматированием', () => {
            renderComponent();

            expect(screen.getByText('Номер телефона')).toBeInTheDocument();
            expect(screen.getByText('+ 79001234567')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отображение данных бронирования
    // ============================================

    describe('Отображение данных бронирования', () => {
        /**
         * Проверяет отображение даты.
         */
        it('должен отображать желаемую дату', () => {
            renderComponent();

            expect(screen.getByText('Желаемая дата')).toBeInTheDocument();
            expect(screen.getByText('15.02.2026')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение времени.
         */
        it('должен отображать время', () => {
            renderComponent();

            expect(screen.getByText('Время')).toBeInTheDocument();
            expect(screen.getByText('с 18:00 по 22:00')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение количества гостей.
         */
        it('должен отображать количество гостей', () => {
            renderComponent();

            expect(screen.getByText('Гости')).toBeInTheDocument();
            expect(screen.getByText('25 человек')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение повода.
         */
        it('должен отображать повод', () => {
            renderComponent();

            expect(screen.getByText('Повод')).toBeInTheDocument();
            expect(screen.getByText('День рождения')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отображение дополнительных услуг
    // ============================================

    describe('Отображение дополнительных услуг', () => {
        /**
         * Проверяет отображение заголовка "Дополнительные услуги".
         */
        it('должен отображать заголовок "Дополнительные услуги"', () => {
            renderComponent();

            expect(screen.getByText('Дополнительные услуги')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение выбранных услуг.
         */
        it('должен отображать выбранные услуги', () => {
            renderComponent();

            expect(screen.getByText('Цветочное оформление, фотограф')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение "Не выбраны" при отсутствии услуг.
         */
        it('должен отображать "Не выбраны" при пустом списке услуг', () => {
            mockForm = { ...mockFormData, selectedServices: [] };
            
            renderComponent();

            expect(screen.getByText('Не выбраны')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Отображение стоимости
    // ============================================

    describe('Отображение стоимости', () => {
        /**
         * Проверяет отображение заголовка стоимости.
         */
        it('должен отображать заголовок "Предварительная стоимость*"', () => {
            renderComponent();

            expect(screen.getByText('Предварительная стоимость*:')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение депозита за человека.
         */
        it('должен отображать депозит за человека', () => {
            renderComponent();

            expect(screen.getByText('Депозит за человека:')).toBeInTheDocument();
            expect(screen.getByText('3000 ₽')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение общего депозита.
         */
        it('должен отображать депозит итого', () => {
            renderComponent();

            expect(screen.getByText('Депозит итого:')).toBeInTheDocument();
            expect(screen.getByText('75000 ₽')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение сервисного сбора.
         */
        it('должен отображать сервисный сбор', () => {
            renderComponent();

            expect(screen.getByText('Сервисный сбор:')).toBeInTheDocument();
            expect(screen.getByText('10%')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение итоговой суммы.
         */
        it('должен отображать итоговую сумму', () => {
            renderComponent();

            expect(screen.getByText('Итого:')).toBeInTheDocument();
            expect(screen.getByText('82500 ₽')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение disclaimer о стоимости.
         */
        it('должен отображать disclaimer о стоимости', () => {
            renderComponent();

            expect(screen.getByText(/Окончательная стоимость банкета будет определена/)).toBeInTheDocument();
        });

        /**
         * Проверяет скрытие блока стоимости при отсутствии price.
         */
        it('не должен отображать блок стоимости при отсутствии price', () => {
            mockForm = { ...mockFormData, price: null };
            
            renderComponent();

            expect(screen.queryByText('Предварительная стоимость*:')).not.toBeInTheDocument();
        });

        /**
         * Проверяет скрытие блока стоимости при deposit = null.
         */
        it('не должен отображать блок стоимости при deposit = null', () => {
            mockForm = { 
                ...mockFormData, 
                price: { ...mockFormData.price!, deposit: null } 
            };
            
            renderComponent();

            expect(screen.queryByText('Предварительная стоимость*:')).not.toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Комментарий
    // ============================================

    describe('Комментарий', () => {
        /**
         * Проверяет отображение заголовка "Комментарий".
         */
        it('должен отображать заголовок "Комментарий"', () => {
            renderComponent();

            expect(screen.getByText('Комментарий')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение поля ввода комментария.
         */
        it('должен отображать поле ввода комментария', () => {
            renderComponent();

            const input = screen.getByTestId('commentary-input');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder', 'Введите комментарий');
        });

        /**
         * Проверяет ввод текста в поле комментария.
         */
        it('должен позволять вводить текст комментария', async () => {
            renderComponent();

            const input = screen.getByTestId('commentary-input');
            fireEvent.change(input, { target: { value: 'Без орехов' } });

            await waitFor(() => {
                expect(input).toHaveValue('Без орехов');
            });
        });
    });

    // ============================================
    // Тесты: Способ связи
    // ============================================

    describe('Способ связи', () => {
        /**
         * Проверяет отображение заголовка "Способ связи".
         */
        it('должен отображать заголовок "Способ связи"', () => {
            renderComponent();

            expect(screen.getByText('Способ связи')).toBeInTheDocument();
        });

        /**
         * Проверяет отображение селектора способа связи.
         */
        it('должен отображать селектор способа связи', () => {
            renderComponent();

            expect(screen.getByTestId('confirmation-select')).toBeInTheDocument();
        });

        /**
         * Проверяет выбор Telegram по умолчанию.
         */
        it('должен иметь Telegram выбранным по умолчанию', () => {
            renderComponent();

            const dropdown = screen.getByTestId('confirmation-select-dropdown');
            expect(dropdown).toHaveValue('telegram');
        });

        /**
         * Проверяет возможность выбора способа связи по телефону.
         */
        it('должен позволять выбрать способ связи по телефону', async () => {
            renderComponent();

            const dropdown = screen.getByTestId('confirmation-select-dropdown');
            fireEvent.change(dropdown, { target: { value: 'phone' } });

            await waitFor(() => {
                expect(dropdown).toHaveValue('phone');
            });
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    describe('Навигация', () => {
        /**
         * Проверяет навигацию назад на страницу дополнительных услуг.
         */
        it('должен навигировать на страницу дополнительных услуг при withAdditionalPage=true', async () => {
            mockForm = { ...mockFormData, withAdditionalPage: true };
            
            renderComponent();

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/additional-services/14');
            });
        });

        /**
         * Проверяет навигацию назад на страницу опции.
         */
        it('должен навигировать на страницу опции при withAdditionalPage=false', async () => {
            mockForm = { ...mockFormData, withAdditionalPage: false };
            
            renderComponent();

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/option/14');
            });
        });
    });

    // ============================================
    // Тесты: Отправка бронирования
    // ============================================

    describe('Отправка бронирования', () => {
        /**
         * Проверяет вызов createBanquetRequest при клике на кнопку.
         */
        it('должен вызывать createBanquetRequest при клике на "Забронировать"', async () => {
            renderComponent();

            const submitButton = screen.getByTestId('submit-button');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCreateBanquetRequest).toHaveBeenCalled();
            });
        });

        /**
         * Проверяет передачу комментария в createBanquetRequest.
         */
        it('должен передавать комментарий в createBanquetRequest', async () => {
            renderComponent();

            const input = screen.getByTestId('commentary-input');
            fireEvent.change(input, { target: { value: 'Мой комментарий' } });

            const submitButton = screen.getByTestId('submit-button');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCreateBanquetRequest).toHaveBeenCalledWith('Мой комментарий', 'telegram');
            });
        });

        /**
         * Проверяет передачу способа связи в createBanquetRequest.
         */
        it('должен передавать способ связи в createBanquetRequest', async () => {
            renderComponent();

            const dropdown = screen.getByTestId('confirmation-select-dropdown');
            fireEvent.change(dropdown, { target: { value: 'phone' } });

            const submitButton = screen.getByTestId('submit-button');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCreateBanquetRequest).toHaveBeenCalledWith('', 'phone');
            });
        });
    });

    // ============================================
    // Тесты: Крайние случаи
    // ============================================

    describe('Крайние случаи', () => {
        /**
         * Проверяет работу при undefined currentRestaurant.
         */
        it('должен корректно работать при undefined currentRestaurant', () => {
            mockForm = { ...mockFormData, currentRestaurant: undefined };
            
            renderComponent();

            // Страница должна рендериться без ошибок
            expect(screen.getByTestId('page')).toBeInTheDocument();
        });

        /**
         * Проверяет форматирование номера телефона без 7 в начале.
         */
        it('должен корректно форматировать номер без 7 в начале', () => {
            // Изменяем мок для этого теста
            const jotai = require('jotai');
            jotai.useAtomValue.mockReturnValue({
                ...mockUser,
                phone_number: '89001234567',
            });
            
            renderComponent();

            expect(screen.getByText('89001234567')).toBeInTheDocument();
        });

        /**
         * Проверяет работу с одной услугой.
         */
        it('должен корректно форматировать одну услугу', () => {
            mockForm = { ...mockFormData, selectedServices: ['Фотограф'] };
            
            renderComponent();

            expect(screen.getByText('Фотограф')).toBeInTheDocument();
        });

        /**
         * Проверяет работу с тремя и более услугами.
         */
        it('должен корректно форматировать несколько услуг', () => {
            mockForm = { 
                ...mockFormData, 
                selectedServices: ['Цветочное оформление', 'Фотограф', 'DJ'] 
            };
            
            renderComponent();

            expect(screen.getByText('Цветочное оформление, фотограф, dj')).toBeInTheDocument();
        });

        /**
         * Проверяет работу при null date.
         */
        it('должен отображать пустую дату при null', () => {
            mockForm = { ...mockFormData, date: null };
            
            renderComponent();

            // Проверяем что страница рендерится
            expect(screen.getByText('Желаемая дата')).toBeInTheDocument();
        });
    });

    // ============================================
    // Тесты: Интеграция с useBanquetForm
    // ============================================

    describe('Интеграция с useBanquetForm', () => {
        /**
         * Проверяет использование form данных.
         */
        it('должен использовать form данные для отображения', () => {
            renderComponent();

            // Проверяем все основные данные из формы
            expect(screen.getByText('Ресторан "Гурман"')).toBeInTheDocument();
            expect(screen.getByText('15.02.2026')).toBeInTheDocument();
            expect(screen.getByText('с 18:00 по 22:00')).toBeInTheDocument();
            expect(screen.getByText('25 человек')).toBeInTheDocument();
            expect(screen.getByText('День рождения')).toBeInTheDocument();
        });

        /**
         * Проверяет использование createBanquetRequest.
         */
        it('должен использовать createBanquetRequest для отправки', async () => {
            renderComponent();

            const submitButton = screen.getByTestId('submit-button');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCreateBanquetRequest).toHaveBeenCalled();
            });
        });
    });

    // ============================================
    // Тесты: URL параметры и данные формы
    // ============================================

    describe('URL параметры и данные формы', () => {
        /**
         * Проверяет использование restaurantId из URL и optionId из формы.
         */
        it('должен использовать restaurantId из URL и optionId из формы', async () => {
            mockForm = { ...mockFormData, optionId: '15', withAdditionalPage: true };
            
            renderComponent({ restaurantId: '42' });

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/42/additional-services/15');
            });
        });

        /**
         * Проверяет что optionId берётся из формы, а не из URL.
         */
        it('должен использовать optionId из формы для навигации', async () => {
            mockForm = { ...mockFormData, optionId: '99', withAdditionalPage: false };
            
            renderComponent({ restaurantId: '1' });

            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/option/99');
            });
        });
    });
});
