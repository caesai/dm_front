/**
 * @fileoverview Тесты для хука useBanquetForm.
 * 
 * Хук useBanquetForm - критичный хук для управления формой бронирования банкета.
 * Отвечает за управление состоянием формы, валидацию и создание запроса на бронирование.
 * 
 * Тесты покрывают:
 * - Установку данных банкета
 * - Управление дополнительными услугами
 * - Обновление полей формы
 * - Сброс формы
 * - Создание запроса на бронирование
 * - Навигацию между страницами
 * - Валидацию данных
 * 
 * @module __tests__/hooks/useBanquetForm
 * 
 * @see {@link useBanquetForm} - тестируемый хук
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useBanquetForm } from '@/hooks/useBanquetForm.ts';
import { banquetFormAtom, IBanquetFormState } from '@/atoms/banquetFormAtom.ts';
import { authAtom } from '@/atoms/userAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockBanquetFormData } from '@/__mocks__/banquets.mock.ts';
import { mockRestaurantWithBanquets } from '@/__mocks__/restaurant.mock.ts';

// ============================================
// Моки внешних зависимостей
// ============================================

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

const mockShowToast = jest.fn();
jest.mock('@/hooks/useToastState', () => ({
    __esModule: true,
    default: () => ({
        showToast: mockShowToast,
    }),
}));

const mockAPIPostBanquetRequest = jest.fn();
jest.mock('@/api/banquet.api.ts', () => ({
    __esModule: true,
    APIPostBanquetRequest: (...args: any[]) => mockAPIPostBanquetRequest(...args),
}));

// Мокируем moment для тестов
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment');
    const momentFn = actualMoment.default || actualMoment;
    return {
        __esModule: true,
        default: momentFn,
        ...actualMoment,
    };
});

// ============================================
// Вспомогательные функции
// ============================================

const renderHookWithProvider = (
    initialForm?: Partial<IBanquetFormState>,
    auth?: { access_token: string } | null
) => {
    // Если auth явно передан как null, используем null, иначе используем дефолтное значение
    const authValue = auth === null ? null : (auth ?? { access_token: 'test_token' });
    
    const initialValues: any[] = [
        [banquetFormAtom, { ...mockBanquetFormData, ...initialForm }],
        [authAtom, authValue],
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestProvider initialValues={initialValues}>{children}</TestProvider>
    );

    return renderHook(() => useBanquetForm(), { wrapper });
};

describe('useBanquetForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('setBanquetData', () => {
        it('должен установить основные данные банкета', () => {
            const { result } = renderHookWithProvider();

            const banquetData = {
                name: 'Банкетный зал',
                date: new Date('2026-02-15'),
                timeFrom: '18:00',
                timeTo: '22:00',
                guestCount: { value: '25', title: '25 человек' },
                reason: 'День рождения',
                currentRestaurant: mockRestaurantWithBanquets,
                restaurantId: '1',
                optionId: '14',
                additionalOptions: [{ id: 1, name: 'Услуга 1' }],
                withAdditionalPage: true,
                price: {
                    deposit: 5000,
                    totalDeposit: 100000,
                    serviceFee: 10,
                    total: 110000,
                },
            };

            act(() => {
                result.current.handlers.setBanquetData(banquetData);
            });

            expect(result.current.form.name).toBe('Банкетный зал');
            expect(result.current.form.date).toEqual(new Date('2026-02-15'));
            expect(result.current.form.timeFrom).toBe('18:00');
            expect(result.current.form.timeTo).toBe('22:00');
            expect(result.current.form.guestCount.value).toBe('25');
            expect(result.current.form.reason).toBe('День рождения');
            expect(result.current.form.selectedServices).toEqual([]);
        });

        it('должен сбросить selectedServices при установке данных', () => {
            const { result } = renderHookWithProvider({
                selectedServices: ['Услуга 1', 'Услуга 2'],
            });

            act(() => {
                result.current.handlers.setBanquetData({
                    name: 'Новый зал',
                    date: new Date('2026-02-15'),
                    timeFrom: '18:00',
                    timeTo: '22:00',
                    guestCount: { value: '25', title: '25 человек' },
                    reason: 'Свадьба',
                    currentRestaurant: mockRestaurantWithBanquets,
                    restaurantId: '1',
                    optionId: '14',
                    additionalOptions: [],
                    withAdditionalPage: false,
                    price: null,
                });
            });

            expect(result.current.form.selectedServices).toEqual([]);
        });
    });

    describe('setSelectedServices', () => {
        it('должен установить выбранные услуги', () => {
            const { result } = renderHookWithProvider();

            act(() => {
                result.current.handlers.setSelectedServices(['Услуга 1', 'Услуга 2']);
            });

            expect(result.current.form.selectedServices).toEqual(['Услуга 1', 'Услуга 2']);
            expect(result.current.form.withAdditionalPage).toBe(true);
        });

        it('должен заменить существующие услуги', () => {
            const { result } = renderHookWithProvider({
                selectedServices: ['Старая услуга'],
            });

            act(() => {
                result.current.handlers.setSelectedServices(['Новая услуга']);
            });

            expect(result.current.form.selectedServices).toEqual(['Новая услуга']);
        });
    });

    describe('toggleService', () => {
        it('должен добавить услугу, если её нет в списке', () => {
            const { result } = renderHookWithProvider({
                selectedServices: ['Услуга 1'],
            });

            act(() => {
                result.current.handlers.toggleService('Услуга 2');
            });

            expect(result.current.form.selectedServices).toEqual(['Услуга 1', 'Услуга 2']);
        });

        it('должен удалить услугу, если она уже в списке', () => {
            const { result } = renderHookWithProvider({
                selectedServices: ['Услуга 1', 'Услуга 2'],
            });

            act(() => {
                result.current.handlers.toggleService('Услуга 1');
            });

            expect(result.current.form.selectedServices).toEqual(['Услуга 2']);
        });

        it('должен добавить услугу в пустой список', () => {
            const { result } = renderHookWithProvider({
                selectedServices: [],
            });

            act(() => {
                result.current.handlers.toggleService('Услуга 1');
            });

            expect(result.current.form.selectedServices).toEqual(['Услуга 1']);
        });
    });

    describe('updateField', () => {
        it('должен обновить отдельные поля формы', () => {
            const { result } = renderHookWithProvider();

            act(() => {
                result.current.handlers.updateField({
                    reason: 'Свадьба',
                    timeFrom: '19:00',
                });
            });

            expect(result.current.form.reason).toBe('Свадьба');
            expect(result.current.form.timeFrom).toBe('19:00');
        });

        it('должен сохранить другие поля при обновлении', () => {
            const { result } = renderHookWithProvider({
                name: 'Банкетный зал',
                reason: 'День рождения',
            });

            act(() => {
                result.current.handlers.updateField({
                    reason: 'Свадьба',
                });
            });

            expect(result.current.form.name).toBe('Банкетный зал');
            expect(result.current.form.reason).toBe('Свадьба');
        });
    });

    describe('resetForm', () => {
        it('должен сбросить форму к начальному состоянию', () => {
            const { result } = renderHookWithProvider({
                name: 'Банкетный зал',
                date: new Date('2026-02-15'),
                timeFrom: '18:00',
                timeTo: '22:00',
                reason: 'День рождения',
                selectedServices: ['Услуга 1'],
                restaurantId: '1',
                optionId: '14',
            });

            act(() => {
                result.current.handlers.resetForm();
            });

            expect(result.current.form.name).toBeUndefined();
            expect(result.current.form.date).toBeNull();
            expect(result.current.form.timeFrom).toBe('с');
            expect(result.current.form.timeTo).toBe('до');
            expect(result.current.form.reason).toBe('');
            expect(result.current.form.selectedServices).toEqual([]);
            expect(result.current.form.restaurantId).toBe('');
            expect(result.current.form.optionId).toBe('');
        });
    });

    describe('createBanquetRequest', () => {
        it('должен создать запрос на бронирование при валидных данных', async () => {
            // Настраиваем мок для успешного ответа ПЕРЕД созданием формы
            mockAPIPostBanquetRequest.mockResolvedValue({
                data: { status: 'success' },
            });

            const formData = {
                date: new Date('2026-02-15'),
                price: {
                    deposit: 5000,
                    totalDeposit: 100000,
                    serviceFee: 10,
                    total: 110000,
                },
                restaurantId: '1',
                optionId: '14',
                timeFrom: '18:00',
                timeTo: '22:00',
                guestCount: { value: '25', title: '25 человек' },
                reason: 'День рождения',
                selectedServices: ['Услуга 1'],
            };

            const { result } = renderHookWithProvider(formData);
            
            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            // Проверяем, что не было ошибок валидации
            expect(mockShowToast).not.toHaveBeenCalledWith('Не все данные заполнены');
            expect(mockShowToast).not.toHaveBeenCalledWith('Необходимо авторизоваться');
            
            // Проверяем, что API был вызван
            expect(mockAPIPostBanquetRequest).toHaveBeenCalled();
            expect(mockAPIPostBanquetRequest).toHaveBeenCalledWith('test_token', expect.objectContaining({
                restaurant_id: 1,
                banquet_option: '14',
                start_time: '18:00',
                end_time: '22:00',
                guests_count: 25,
                occasion: 'День рождения',
                additional_services: ['Услуга 1'],
                comment: 'Комментарий',
                contact_method: 'telegram',
                estimated_cost: 110000,
            }));

            expect(success).toBe(true);
            expect(mockShowToast).toHaveBeenCalledWith(
                'Ваш запрос на бронирование банкета принят. Наш менеджер скоро свяжется с вами.'
            );
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });

        it('должен показать ошибку при отсутствии авторизации', async () => {
            const { result } = renderHookWithProvider(
                {
                    date: new Date('2026-02-15'),
                    price: {
                        deposit: 5000,
                        totalDeposit: 100000,
                        serviceFee: 10,
                        total: 110000,
                    },
                },
                null
            );

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            expect(success).toBe(false);
            expect(mockShowToast).toHaveBeenCalledWith('Необходимо авторизоваться');
            expect(mockAPIPostBanquetRequest).not.toHaveBeenCalled();
        });

        it('должен показать ошибку при отсутствии даты', async () => {
            const { result } = renderHookWithProvider({
                date: null,
                price: {
                    deposit: 5000,
                    totalDeposit: 100000,
                    serviceFee: 10,
                    total: 110000,
                },
            });

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            expect(success).toBe(false);
            expect(mockShowToast).toHaveBeenCalledWith('Не все данные заполнены');
            expect(mockAPIPostBanquetRequest).not.toHaveBeenCalled();
        });

        it('должен показать ошибку при отсутствии цены', async () => {
            const { result } = renderHookWithProvider({
                date: new Date('2026-02-15'),
                price: null,
            });

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            expect(success).toBe(false);
            expect(mockShowToast).toHaveBeenCalledWith('Не все данные заполнены');
            expect(mockAPIPostBanquetRequest).not.toHaveBeenCalled();
        });

        it('должен обработать ошибку API', async () => {
            mockAPIPostBanquetRequest.mockRejectedValue(new Error('API Error'));

            const { result } = renderHookWithProvider({
                date: new Date('2026-02-15'),
                price: {
                    deposit: 5000,
                    totalDeposit: 100000,
                    serviceFee: 10,
                    total: 110000,
                },
                restaurantId: '1',
                optionId: '14',
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            expect(success).toBe(false);
            expect(mockShowToast).toHaveBeenCalledWith('Произошла ошибка при создании запроса');
            expect(consoleSpy).toHaveBeenCalledWith('Banquet request error:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('должен обработать неуспешный ответ API', async () => {
            mockAPIPostBanquetRequest.mockResolvedValue({
                data: { status: 'error' },
            });

            const { result } = renderHookWithProvider({
                date: new Date('2026-02-15'),
                price: {
                    deposit: 5000,
                    totalDeposit: 100000,
                    serviceFee: 10,
                    total: 110000,
                },
                restaurantId: '1',
                optionId: '14',
            });

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.createBanquetRequest('Комментарий', 'telegram');
            });

            expect(success).toBe(false);
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });

    describe('navigateToNextPage', () => {
        it('должен перейти на страницу дополнительных услуг, если они есть', () => {
            const { result } = renderHookWithProvider({
                additionalOptions: [
                    { id: 1, name: 'Услуга 1' },
                    { id: 2, name: 'Услуга 2' },
                ],
                restaurantId: '1',
                optionId: '14',
            });

            act(() => {
                result.current.navigateToNextPage();
            });

            expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/additional-services/14');
        });

        it('должен перейти на страницу резервации, если нет дополнительных услуг', () => {
            const { result } = renderHookWithProvider({
                additionalOptions: [],
                restaurantId: '1',
                optionId: '14',
            });

            act(() => {
                result.current.navigateToNextPage();
            });

            expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/reservation');
        });
    });

    describe('navigateToReservation', () => {
        it('должен перейти на страницу резервации', () => {
            const { result } = renderHookWithProvider({
                restaurantId: '1',
            });

            act(() => {
                result.current.navigateToReservation();
            });

            expect(mockedNavigate).toHaveBeenCalledWith('/banquets/1/reservation');
        });
    });
});
