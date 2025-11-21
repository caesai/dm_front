import { atom } from 'jotai';
/**
 * @interface ToastState
 * Представляет структуру данных для состояния Toast уведомления.
 */
interface ToastState {
    message: string;
    type: TToast;
    isVisible: boolean;
}
export type TToast = 'info' | 'success' | 'warning' | 'error' | '';
/**
 * Атом Jotai, содержащий текущее состояние Toast.
 * Используется компонентом Toast для чтения состояния.
 * @type {import('jotai').WritableAtom<ToastState, ToastState, void>}
 */
export const toastAtom = atom<ToastState>({
    message: '',
    type: '',
    isVisible: false,
});

/**
 * Атом Jotai только для записи (set-only atom).
 * Предоставляет функцию для запуска процесса отображения Toast.
 * Он управляет логикой показа, автоматического скрытия через 6 секунд и установкой типа.
 * @type {import('jotai').SetStateAction<{ message: string, type?: ToastState['type'] }>}
 */
export const showToastAtom = atom(null, (_get, set, updates: { message: string, type?: TToast }) => {
    const type = updates.type || 'info';
    set(toastAtom, { message: updates.message, type, isVisible: true });

    // Автоматическое скрытие
    setTimeout(() => {
        set(toastAtom, (prev) => ({ ...prev, isVisible: false }));
    }, 6000);
});
