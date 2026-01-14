/**
 * @fileoverview Тесты для страницы заполнения анкеты Hospitality Heroes.
 *
 * Страница предназначена для заполнения анкеты участника программы Hospitality Heroes.
 * Пользователь попадает сюда со страницы HospitalityHeroesPage.
 *
 * Основные функции страницы:
 * - Отображение формы с полями: имя, фамилия, телефон, место работы, должность, опыт работы
 * - Предзаполнение полей из данных пользователя (имя, фамилия, телефон)
 * - Валидация обязательных полей (все поля обязательны)
 * - Отправка анкеты через API
 * - Редирект на страницу Привилегии после успешной отправки
 *
 * @module __tests__/privilege/HospitalityHeroesApplicationFormPage
 *
 * @see {@link HospitalityHeroesApplicationFormPage} - тестируемый компонент
 * @see {@link HospitalityHeroesPage} - страница, с которой пользователь переходит на анкету
 * @see {@link PrivilegePage} - страница, на которую происходит редирект после успешной отправки
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HospitalityHeroesApplicationFormPage } from '@/pages/HospitalityHeroesPage/HospitalityHeroesApplicationFormPage';
import { userAtom, authAtom } from '@/atoms/userAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockUserData } from '@/__mocks__/user.mock';
import { IUser } from '@/types/user.types.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

/**
 * Мок функции навигации react-router-dom.
 * Позволяет проверять вызовы navigate() в тестах.
 */
const mockedNavigate = jest.fn();

/**
 * Мок функции goBack из useNavigationHistory.
 */
const mockedGoBack = jest.fn();

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
}));

/**
 * Мок хука useNavigationHistory.
 */
jest.mock('@/hooks/useNavigationHistory.ts', () => ({
    useNavigationHistory: () => ({
        goBack: mockedGoBack,
    }),
}));

/**
 * Мок хука useToastState.
 */
const mockedShowToast = jest.fn();
jest.mock('@/hooks/useToastState.ts', () => ({
    __esModule: true,
    default: () => ({
        showToast: mockedShowToast,
    }),
}));

/**
 * Мок API для создания заявки Hospitality Heroes.
 * - APIPostSuperEventCreateApplication - создаёт заявку на участие в программе
 */
const mockAPIPostSuperEventCreateApplication = jest.fn();
const mockAPIUserInfo = jest.fn();

jest.mock('@/api/events.api.ts', () => ({
    APIPostSuperEventCreateApplication: (...args: any[]) => mockAPIPostSuperEventCreateApplication(...args),
}));

jest.mock('@/api/auth.api.ts', () => ({
    APIUserInfo: (...args: any[]) => mockAPIUserInfo(...args),
}));

/**
 * Мок Telegram SDK.
 * Имитирует backButton для работы компонента.
 */
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        hide: jest.fn(),
        onClick: jest.fn(() => jest.fn()),
    },
    mainButton: {
        onClick: jest.fn(() => jest.fn()),
        setParams: jest.fn(),
        mount: {
            isAvailable: jest.fn(),
        },
        unmount: jest.fn(),
    },
}));

// ============================================
// Тестовый набор
// ============================================

/**
 * Тесты страницы заполнения анкеты Hospitality Heroes.
 *
 * Покрывает следующие сценарии:
 * - Отображение формы с обязательными полями
 * - Предзаполнение полей из данных пользователя
 * - Валидация обязательных полей
 * - Кнопка отправки заблокирована при невалидной форме
 * - Успешная отправка анкеты
 * - Обработка ошибок API
 * - Навигация назад
 */
describe('HospitalityHeroesApplicationFormPage', () => {
    // ============================================
    // Вспомогательные функции
    // ============================================

    /**
     * Рендерит компонент HospitalityHeroesApplicationFormPage с необходимыми провайдерами.
     *
     * @param user - Данные пользователя (по умолчанию mockUserData)
     * @returns Результат render() из @testing-library/react
     *
     * @example
     * // Рендер с данными пользователя по умолчанию
     * renderComponent();
     *
     * @example
     * // Рендер с кастомным пользователем
     * renderComponent({ ...mockUserData, first_name: 'Иван' });
     */
    const renderComponent = (user: IUser | undefined = mockUserData) => {
        const initialValues: Array<readonly [any, unknown]> = [
            [userAtom, user],
            [authAtom, { access_token: 'test-token' }],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={['/hospitality-heroes/application']}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route
                            path="/hospitality-heroes/application"
                            element={<HospitalityHeroesApplicationFormPage />}
                        />
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

    beforeEach(() => {
        jest.clearAllMocks();

        // Подавляем ожидаемые ошибки в консоли
        jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const message = String(args[0] || '');
            if (
                message.includes('not wrapped in act') ||
                message.includes('Error')
            ) {
                return;
            }
            originalConsoleError(...args);
        });

        // Настройка успешного ответа API по умолчанию
        mockAPIPostSuperEventCreateApplication.mockResolvedValue({
            data: { success: true },
        });

        mockAPIUserInfo.mockResolvedValue({
            data: mockUserData,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ============================================
    // Тесты: Отображение формы
    // ============================================

    /**
     * Тесты отображения формы и её элементов.
     */
    describe('Отображение формы', () => {
        /**
         * Проверяет отображение заголовка страницы.
         */
        test('должен отображать заголовок "Анкета"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Анкета')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет наличие всех полей формы.
         */
        test('должен отображать все поля формы', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Ваша фамилия')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Ваш контактный номер')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Ваша должность')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Ваш опыт работы')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет отображение кнопки "Присоединиться".
         */
        test('должен отображать кнопку "Присоединиться"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Присоединиться')).toBeInTheDocument();
            });
        });

        /**
         * Проверяет наличие кнопки "Назад".
         */
        test('должен отображать кнопку "Назад"', async () => {
            renderComponent();

            await waitFor(() => {
                // Кнопка назад - это RoundedButton с BackIcon
                const backButton = document.querySelector('button');
                expect(backButton).toBeInTheDocument();
            });
        });
    });

    // ============================================
    // Тесты: Предзаполнение данных
    // ============================================

    /**
     * Тесты предзаполнения полей из данных пользователя.
     */
    describe('Предзаполнение данных пользователя', () => {
        /**
         * Проверяет предзаполнение имени из данных пользователя.
         */
        test('должен предзаполнять имя из данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('Ваше имя');
                expect(nameInput).toHaveValue(mockUserData.first_name);
            });
        });

        /**
         * Проверяет предзаполнение фамилии из данных пользователя.
         */
        test('должен предзаполнять фамилию из данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                const surnameInput = screen.getByPlaceholderText('Ваша фамилия');
                expect(surnameInput).toHaveValue(mockUserData.last_name);
            });
        });

        /**
         * Проверяет предзаполнение телефона из данных пользователя.
         */
        test('должен предзаполнять телефон из данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                const phoneInput = screen.getByPlaceholderText('Ваш контактный номер');
                expect(phoneInput).toHaveValue(mockUserData.phone_number);
            });
        });

        /**
         * Проверяет пустые значения для полей без данных пользователя.
         */
        test('должен оставлять пустыми поля без данных пользователя', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toHaveValue('');
                expect(screen.getByPlaceholderText('Ваша должность')).toHaveValue('');
                expect(screen.getByPlaceholderText('Ваш опыт работы')).toHaveValue('');
            });
        });
    });

    // ============================================
    // Тесты: Валидация формы
    // ============================================

    /**
     * Тесты валидации обязательных полей формы.
     */
    describe('Валидация формы', () => {
        /**
         * Проверяет, что кнопка отправки неактивна при пустых обязательных полях.
         */
        test('кнопка должна быть неактивна когда не все поля заполнены', async () => {
            renderComponent();

            await waitFor(() => {
                const button = screen.getByText('Присоединиться').closest('button');
                expect(button).toBeDisabled();
            });
        });

        /**
         * Проверяет, что кнопка активна когда все поля заполнены.
         */
        test('кнопка должна быть активна когда все поля заполнены', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            // Заполняем недостающие поля
            fireEvent.change(screen.getByPlaceholderText('Ваше место работы'), {
                target: { value: 'Ресторан "Тест"' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваша должность'), {
                target: { value: 'Официант' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваш опыт работы'), {
                target: { value: '5 лет в сфере гостеприимства' },
            });

            await waitFor(() => {
                const button = screen.getByText('Присоединиться').closest('button');
                expect(button).not.toBeDisabled();
            });
        });

        /**
         * Проверяет, что все поля имеют атрибут required.
         */
        test('все поля должны иметь атрибут required', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше имя')).toBeRequired();
                expect(screen.getByPlaceholderText('Ваша фамилия')).toBeRequired();
                expect(screen.getByPlaceholderText('Ваш контактный номер')).toBeRequired();
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeRequired();
                expect(screen.getByPlaceholderText('Ваша должность')).toBeRequired();
                expect(screen.getByPlaceholderText('Ваш опыт работы')).toBeRequired();
            });
        });

        /**
         * Проверяет, что пробелы не считаются валидным значением.
         */
        test('пробелы не должны считаться валидным значением', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            // Заполняем поля пробелами
            fireEvent.change(screen.getByPlaceholderText('Ваше место работы'), {
                target: { value: '   ' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваша должность'), {
                target: { value: '   ' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваш опыт работы'), {
                target: { value: '   ' },
            });

            await waitFor(() => {
                const button = screen.getByText('Присоединиться').closest('button');
                expect(button).toBeDisabled();
            });
        });
    });

    // ============================================
    // Тесты: Ввод данных
    // ============================================

    /**
     * Тесты изменения значений полей формы.
     */
    describe('Ввод данных', () => {
        /**
         * Проверяет возможность изменения имени.
         */
        test('должен позволять изменять имя', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
            });

            const nameInput = screen.getByPlaceholderText('Ваше имя');
            fireEvent.change(nameInput, { target: { value: 'Иван' } });

            expect(nameInput).toHaveValue('Иван');
        });

        /**
         * Проверяет возможность изменения фамилии.
         */
        test('должен позволять изменять фамилию', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваша фамилия')).toBeInTheDocument();
            });

            const surnameInput = screen.getByPlaceholderText('Ваша фамилия');
            fireEvent.change(surnameInput, { target: { value: 'Иванов' } });

            expect(surnameInput).toHaveValue('Иванов');
        });

        /**
         * Проверяет фильтрацию ввода для телефона (только цифры, +, -, пробелы, скобки).
         */
        test('должен фильтровать ввод для телефона', async () => {
            renderComponent({ ...mockUserData, phone_number: '' });

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваш контактный номер')).toBeInTheDocument();
            });

            const phoneInput = screen.getByPlaceholderText('Ваш контактный номер');
            fireEvent.change(phoneInput, { target: { value: '+7 (999) 123-45-67abc' } });

            // Буквы должны быть отфильтрованы
            expect(phoneInput).toHaveValue('+7 (999) 123-45-67');
        });

        /**
         * Проверяет ввод места работы.
         */
        test('должен позволять вводить место работы', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            const workPlaceInput = screen.getByPlaceholderText('Ваше место работы');
            fireEvent.change(workPlaceInput, { target: { value: 'Ресторан "Тест"' } });

            expect(workPlaceInput).toHaveValue('Ресторан "Тест"');
        });

        /**
         * Проверяет ввод должности.
         */
        test('должен позволять вводить должность', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваша должность')).toBeInTheDocument();
            });

            const jobTitleInput = screen.getByPlaceholderText('Ваша должность');
            fireEvent.change(jobTitleInput, { target: { value: 'Официант' } });

            expect(jobTitleInput).toHaveValue('Официант');
        });

        /**
         * Проверяет ввод опыта работы (textarea).
         */
        test('должен позволять вводить опыт работы', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваш опыт работы')).toBeInTheDocument();
            });

            const experienceTextarea = screen.getByPlaceholderText('Ваш опыт работы');
            fireEvent.change(experienceTextarea, {
                target: { value: '5 лет в сфере гостеприимства. Работал в нескольких ресторанах.' },
            });

            expect(experienceTextarea).toHaveValue(
                '5 лет в сфере гостеприимства. Работал в нескольких ресторанах.'
            );
        });
    });

    // ============================================
    // Тесты: Отправка формы
    // ============================================

    /**
     * Тесты процесса отправки анкеты.
     */
    describe('Отправка формы', () => {
        /**
         * Заполняет все поля формы валидными данными.
         */
        const fillForm = () => {
            fireEvent.change(screen.getByPlaceholderText('Ваше место работы'), {
                target: { value: 'Ресторан "Тест"' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваша должность'), {
                target: { value: 'Официант' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваш опыт работы'), {
                target: { value: '5 лет опыта' },
            });
        };

        /**
         * Проверяет вызов API с правильными параметрами при отправке формы.
         */
        test('должен вызывать API с правильными данными при отправке', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            fillForm();

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(mockAPIPostSuperEventCreateApplication).toHaveBeenCalledWith(
                    'test-token',
                    {
                        name: mockUserData.first_name,
                        surname: mockUserData.last_name,
                        phone: mockUserData.phone_number,
                        work_place: 'Ресторан "Тест"',
                        job_title: 'Официант',
                        experience: '5 лет опыта',
                    }
                );
            });
        });

        /**
         * Проверяет редирект на страницу Привилегии после успешной отправки.
         */
        test('должен перенаправлять на /privilege после успешной отправки', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            fillForm();

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(mockedNavigate).toHaveBeenCalledWith('/privilege', {
                    state: { application_success: true },
                });
            });
        });

        /**
         * Проверяет обновление данных пользователя после успешной отправки.
         */
        test('должен обновлять данные пользователя после успешной отправки', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            fillForm();

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(mockAPIUserInfo).toHaveBeenCalledWith('test-token');
            });
        });
    });

    // ============================================
    // Тесты: Обработка ошибок
    // ============================================

    /**
     * Тесты обработки ошибок API.
     */
    describe('Обработка ошибок', () => {
        /**
         * Заполняет все поля формы валидными данными.
         */
        const fillForm = () => {
            fireEvent.change(screen.getByPlaceholderText('Ваше место работы'), {
                target: { value: 'Ресторан "Тест"' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваша должность'), {
                target: { value: 'Официант' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваш опыт работы'), {
                target: { value: '5 лет опыта' },
            });
        };

        /**
         * Проверяет отображение toast при ошибке API.
         */
        test('должен показывать toast при ошибке отправки', async () => {
            mockAPIPostSuperEventCreateApplication.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            fillForm();

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(mockedShowToast).toHaveBeenCalledWith(
                    'Произошла ошибка при присоединении к программе. Попробуйте позже'
                );
            });
        });

        /**
         * Проверяет, что не происходит редирект при ошибке API.
         */
        test('не должен перенаправлять при ошибке отправки', async () => {
            mockAPIPostSuperEventCreateApplication.mockRejectedValue(new Error('Network error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            fillForm();

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(mockedShowToast).toHaveBeenCalled();
            });

            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // Тесты: Навигация
    // ============================================

    /**
     * Тесты навигации.
     */
    describe('Навигация', () => {
        /**
         * Проверяет вызов goBack при нажатии на кнопку "Назад".
         * RoundedButton - это div с классом rounded_button, который вызывает action() при клике.
         */
        test('должен вызывать goBack при нажатии на кнопку "Назад"', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Анкета')).toBeInTheDocument();
            });

            // Находим кнопку назад по SVG иконке внутри
            const backIcon = document.querySelector('svg');
            expect(backIcon).toBeInTheDocument();

            // Кликаем по родительскому элементу (rounded_button div)
            const backButton = backIcon!.parentElement;
            expect(backButton).toHaveClass('rounded_button');

            await act(async () => {
                fireEvent.click(backButton!);
            });

            expect(mockedGoBack).toHaveBeenCalled();
        });
    });

    // ============================================
    // Тесты: Крайние случаи
    // ============================================

    /**
     * Тесты крайних случаев.
     */
    describe('Крайние случаи', () => {
        /**
         * Проверяет работу формы без данных пользователя.
         * При отсутствии данных пользователя поля должны быть пустыми.
         */
        test('должен работать без данных пользователя', async () => {
            // Передаём null вместо undefined, чтобы явно указать отсутствие пользователя
            const initialValues: Array<readonly [any, unknown]> = [
                [userAtom, null],
                [authAtom, { access_token: 'test-token' }],
            ];

            render(
                <TestProvider initialValues={initialValues}>
                    <MemoryRouter
                        initialEntries={['/hospitality-heroes/application']}
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                    >
                        <Routes>
                            <Route
                                path="/hospitality-heroes/application"
                                element={<HospitalityHeroesApplicationFormPage />}
                            />
                        </Routes>
                    </MemoryRouter>
                </TestProvider>
            );

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше имя')).toHaveValue('');
                expect(screen.getByPlaceholderText('Ваша фамилия')).toHaveValue('');
                expect(screen.getByPlaceholderText('Ваш контактный номер')).toHaveValue('');
            });
        });

        /**
         * Проверяет работу формы с частичными данными пользователя.
         */
        test('должен работать с частичными данными пользователя', async () => {
            const partialUser: IUser = {
                ...mockUserData,
                first_name: 'Иван',
                last_name: '',
                phone_number: '',
            };

            renderComponent(partialUser);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше имя')).toHaveValue('Иван');
                expect(screen.getByPlaceholderText('Ваша фамилия')).toHaveValue('');
                expect(screen.getByPlaceholderText('Ваш контактный номер')).toHaveValue('');
            });
        });

        /**
         * Проверяет, что форма не отправляется без токена авторизации.
         */
        test('не должен отправлять форму без токена авторизации', async () => {
            const initialValues: Array<readonly [any, unknown]> = [
                [userAtom, mockUserData],
                [authAtom, null],
            ];

            render(
                <TestProvider initialValues={initialValues}>
                    <MemoryRouter
                        initialEntries={['/hospitality-heroes/application']}
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                    >
                        <Routes>
                            <Route
                                path="/hospitality-heroes/application"
                                element={<HospitalityHeroesApplicationFormPage />}
                            />
                        </Routes>
                    </MemoryRouter>
                </TestProvider>
            );

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Ваше место работы')).toBeInTheDocument();
            });

            // Заполняем все поля
            fireEvent.change(screen.getByPlaceholderText('Ваше место работы'), {
                target: { value: 'Ресторан' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваша должность'), {
                target: { value: 'Официант' },
            });
            fireEvent.change(screen.getByPlaceholderText('Ваш опыт работы'), {
                target: { value: '5 лет' },
            });

            const submitButton = screen.getByText('Присоединиться');

            await act(async () => {
                fireEvent.click(submitButton);
            });

            // API не должен быть вызван без токена
            expect(mockAPIPostSuperEventCreateApplication).not.toHaveBeenCalled();
        });
    });
});
