/**
 * @fileoverview Хук для управления формой бронирования банкета.
 * 
 * Хук инкапсулирует логику формы бронирования банкета:
 * - Управление состоянием формы через Jotai atoms
 * - Сохранение данных между страницами
 * - Создание запроса на бронирование банкета
 * 
 * @module hooks/useBanquetForm
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import moment from 'moment';
// API
import { APIPostBanquetRequest } from '@/api/banquet.api.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import {
    banquetFormAtom,
    updateBanquetFormAtom,
    resetBanquetFormAtom,
    IBanquetFormState,
    IBanquetPrice,
} from '@/atoms/banquetFormAtom.ts';
// Types
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { IRestaurant } from '@/types/restaurant.types.ts';
// Hooks
import useToastState from '@/hooks/useToastState.ts';

/**
 * Хук для управления формой бронирования банкета.
 * 
 * @returns Объект с состоянием формы, обработчиками и методами
 */
export const useBanquetForm = () => {
    const navigate = useNavigate();
    const { showToast } = useToastState();

    // Atoms
    const auth = useAtomValue(authAtom);
    const [form, setForm] = useAtom(banquetFormAtom);
    const updateForm = useSetAtom(updateBanquetFormAtom);
    const resetFormAtom = useSetAtom(resetBanquetFormAtom);

    // ============================================
    // Form Update Handlers
    // ============================================

    /**
     * Устанавливает основные данные банкета (с BanquetOptionPage)
     */
    const setBanquetData = useCallback((data: {
        name: string | undefined;
        date: Date | null;
        timeFrom: string;
        timeTo: string;
        guestCount: PickerValue;
        reason: string;
        currentRestaurant: IRestaurant | undefined;
        restaurantId: string;
        optionId: string;
        additionalOptions: { id: number; name: string }[];
        withAdditionalPage: boolean;
        price: IBanquetPrice | null;
    }) => {
        setForm({
            ...form,
            ...data,
            selectedServices: [],
        });
    }, [form, setForm]);

    /**
     * Обновляет выбранные дополнительные услуги
     */
    const setSelectedServices = useCallback((services: string[]) => {
        updateForm({ selectedServices: services, withAdditionalPage: true });
    }, [updateForm]);

    /**
     * Переключает выбор дополнительной услуги
     */
    const toggleService = useCallback((serviceName: string) => {
        const currentServices = form.selectedServices;
        const newServices = currentServices.includes(serviceName)
            ? currentServices.filter(name => name !== serviceName)
            : [...currentServices, serviceName];
        updateForm({ selectedServices: newServices });
    }, [form.selectedServices, updateForm]);

    /**
     * Обновляет отдельные поля формы
     */
    const updateField = useCallback((update: Partial<IBanquetFormState>) => {
        updateForm(update);
    }, [updateForm]);

    /**
     * Сбрасывает форму к начальному состоянию
     */
    const resetForm = useCallback(() => {
        resetFormAtom();
    }, [resetFormAtom]);

    // ============================================
    // Create Banquet Request
    // ============================================

    /**
     * Создаёт запрос на бронирование банкета
     * @param commentary - Комментарий к бронированию
     * @param contactMethod - Способ связи (telegram/phone)
     */
    const createBanquetRequest = useCallback(async (
        commentary: string,
        contactMethod: string
    ): Promise<boolean> => {
        if (!auth?.access_token) {
            showToast('Необходимо авторизоваться');
            return false;
        }

        if (!form.date || !form.price) {
            showToast('Не все данные заполнены');
            return false;
        }

        try {
            const response = await APIPostBanquetRequest(auth.access_token, {
                restaurant_id: Number(form.restaurantId),
                banquet_option: form.optionId,
                date: moment(form.date).toISOString(),
                start_time: form.timeFrom,
                end_time: form.timeTo,
                guests_count: Number(form.guestCount.value),
                occasion: form.reason,
                additional_services: form.selectedServices,
                comment: commentary,
                contact_method: contactMethod,
                estimated_cost: form.price.total,
            });

            if (response.data.status === 'success') {
                showToast('Ваш запрос на бронирование банкета принят. Наш менеджер скоро свяжется с вами.');
                resetForm();
                navigate('/');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Banquet request error:', error);
            showToast('Произошла ошибка при создании запроса');
            return false;
        }
    }, [auth?.access_token, form, navigate, resetForm, showToast]);

    // ============================================
    // Navigation Helpers
    // ============================================

    /**
     * Навигация на страницу дополнительных услуг или резервации
     */
    const navigateToNextPage = useCallback(() => {
        if (form.additionalOptions && form.additionalOptions.length > 0) {
            navigate(`/banquets/${form.restaurantId}/additional-services/${form.optionId}`);
        } else {
            navigate(`/banquets/${form.restaurantId}/reservation`);
        }
    }, [form.additionalOptions, form.restaurantId, form.optionId, navigate]);

    /**
     * Навигация на страницу резервации
     */
    const navigateToReservation = useCallback(() => {
        navigate(`/banquets/${form.restaurantId}/reservation`);
    }, [form.restaurantId, navigate]);

    return {
        // ============================================
        // Состояние формы
        // ============================================
        
        /** Текущее состояние всех полей формы бронирования банкета */
        form,
        
        // ============================================
        // Обработчики изменений формы
        // ============================================
        
        /**
         * Объект с обработчиками для компонентов формы.
         */
        handlers: {
            /** Устанавливает основные данные банкета */
            setBanquetData,
            /** Устанавливает выбранные дополнительные услуги */
            setSelectedServices,
            /** Переключает выбор услуги */
            toggleService,
            /** Обновляет отдельные поля формы */
            updateField,
            /** Сбрасывает форму */
            resetForm,
        },
        
        // ============================================
        // Навигация
        // ============================================
        
        /** Навигация на следующую страницу */
        navigateToNextPage,
        /** Навигация на страницу резервации */
        navigateToReservation,
        
        // ============================================
        // Действия
        // ============================================
        
        /** 
         * Создаёт запрос на бронирование банкета.
         * @param commentary - Комментарий
         * @param contactMethod - Способ связи
         * @returns Promise<boolean> - успешность операции
         */
        createBanquetRequest,
    };
};
