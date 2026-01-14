import { atom, PrimitiveAtom } from 'jotai';
import { IAuthInfo, IUser, TUserPermissions } from '@/types/user.types.ts';
import { getDataFromLocalStorage, setDataToLocalStorage } from '@/utils.ts';

/**
 * @description Атом для получения пользователя
 * @returns {IUser} - Пользователь
 */
export const userAtom = atom<IUser>();

/**
 * @description Атом для получения авторизации
 * @returns {IAuthInfo} - Авторизация
 */
export const authAtom = atom<IAuthInfo>();

/**
 * @description Атом для получения нормализованных разрешений пользователя
 * 
 * Выполняет следующую нормализацию:
 * - Гарантирует возврат массива (защита от `null`/`undefined`)
 * - Фильтрует только строковые значения
 * - Приводит все значения к нижнему регистру
 * - Удаляет лишние пробелы
 * 
 * @returns {TUserPermissions[]} Массив нормализованных разрешений пользователя
 * 
 * @example
 * ```tsx
 * const permissions = useAtomValue(permissionsAtom);
 * if (permissions.includes('hospitality_heroes')) {
 *   // Показать привилегии
 * }
 * ```
 */
export const permissionsAtom = atom<TUserPermissions[]>((get) => {
    const user = get(userAtom);
    const permissions = user?.permissions;
    
    // Если permissions не массив или null/undefined, возвращаем пустой массив
    if (!Array.isArray(permissions)) {
        return [];
    }
    
    // Нормализуем: убираем пробелы и приводим к нижнему регистру
    return permissions
        .filter((p): p is TUserPermissions => typeof p === 'string')
        .map(p => p.toLowerCase().trim() as TUserPermissions);
});

/**
 * @description Атом для проверки, является ли пользователь тестером
 * @returns {boolean} `true` если у пользователя есть разрешение `tester`, иначе `false`
 */
export const isUserTesterAtom = atom<boolean>((get) => get(permissionsAtom).includes('tester'));

/**
 * @interface ITesterMode
 * @description Интерфейс для тестового режима
 * @property {boolean} enabled - Флаг, указывающий, включен ли тестовый режим
 */
interface ITesterMode {
    enabled: boolean;
}

// Базовый атом для хранения состояния тестового режима (инициализируется из localStorage)
const getInitialTesterMode = (): ITesterMode => {
    const testerMode = getDataFromLocalStorage('TESTER_MODE');
    return testerMode ? JSON.parse(testerMode) : { enabled: false };
};
const baseTesterModeAtom: PrimitiveAtom<ITesterMode> = atom<ITesterMode>(getInitialTesterMode());

/**
 * @description Атом для получения и установки тестового режима
 * @returns {ITesterMode} - Тестовый режим (включен/выключен)
 */
export const testerModeAtom = atom<ITesterMode, [ITesterMode], void>(
    (get) => {
        // Проверяем, является ли пользователь тестером
        const isUserTester = get(isUserTesterAtom);
        // Если пользователь тестер, возвращаем состояние из базового атома
        if (isUserTester) {
            return get(baseTesterModeAtom);
        }
        // Если пользователь не тестер, возвращаем false
        return { enabled: false };
    },
    (_get, set, newVal) => {
        // Сохраняем в localStorage и обновляем базовый атом
        setDataToLocalStorage('TESTER_MODE', newVal);
        set(baseTesterModeAtom, newVal);
    }
);

/**
 * @description Атом для установки тестового режима
 * @param {boolean} newVal - Флаг, указывающий, включен ли тестовый режим
 */
export const setTesterModeAtom = atom(null, (_get, set, newVal: boolean) => {
    set(testerModeAtom, { enabled: newVal });
});

// TODO: Выяснить нужно ли этот атом
interface IReviewAtom {
    available: boolean;
    loading: boolean;
}

export const reviewAtom = atom<IReviewAtom>({
    available: false,
    loading: true,
});