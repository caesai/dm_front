// hooks/useToast.ts
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { showToastAtom, TToast } from '@/atoms/toastAtom.ts';

/**
 * Пользовательский хук для вызова Toast уведомлений в любом компоненте приложения.
 * Использует Jotai useSetAtom для доступа к функции записи состояния.
 * @returns {{ showToast: (message: string, type?: ToastState['type']) => void }} Объект с функцией showToast.
 */
const useToast = () => {
    // Получаем функцию только для установки состояния (записи в атом)
    const setShowToast = useSetAtom(showToastAtom);
    /**
     * Функция для отображения Toast уведомления.
     * @param {string} message Сообщение для отображения.
     * @param type TToast Тип уведомления (success, error, warning, info).
     */
    const showToast = useCallback((message: string, type?: TToast) => {
        setShowToast({ message, type });
    }, [setShowToast]);

    return { showToast };
};

export default useToast;
