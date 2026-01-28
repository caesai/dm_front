import { Atom, atom } from 'jotai';

/**
 * Интерфейс для представления города.
 *
 * @interface ICity
 */
export interface ICity {
    id: number;
    name: string;
    name_english: string;
    name_dative: string;
}

/**
 * Константа для представления города по умолчанию.
 *
 * @constant DEFAULT_CITY
 */
export const DEFAULT_CITY: ICity = {
    id: 0,
    name: 'Москва',
    name_english: 'moscow',
    name_dative: 'Москве',
};

/**
 * Тип для представления списка городов.
 *
 * @type TCityList
 */
export type TCityList = ICity[];

/**
 * Атом для представления списка городов.
 *
 * @constant cityListAtom
 */
export const cityListAtom: Atom<TCityList> = atom<TCityList>([]);

/**
 * Примитивный атом для хранения текущего города.
 * Инициализируется значением из localStorage.
 *
 * @constant currentCityAtom
 */
export const currentCityAtom = atom(localStorage.getItem('currentCity') ?? DEFAULT_CITY.name_english);

/**
 * Атом для получения текущего города.
 *
 * @constant getCurrentCity
 */
export const getCurrentCity = atom((get) => {
    const current = get(currentCityAtom);
    const list = get(cityListAtom);
    return list.find((c) => c.name_english === current) ?? DEFAULT_CITY;
});

/**
 * Атом для получения ID текущего города.
 * Использует getCurrentCity для избежания дублирования поиска.
 *
 * @constant getCurrentCityId
 */
export const getCurrentCityId = atom((get) => {
    return get(getCurrentCity).id;
});

/**
 * Атом для установки текущего города.
 * Обновляет атом и синхронизирует с localStorage.
 *
 * @constant setCurrentCityAtom
 */
export const setCurrentCityAtom = atom(
    (get) => get(currentCityAtom),
    (_get, set, newVal: string) => {
        set(currentCityAtom, newVal);
        localStorage.setItem('currentCity', newVal);
    }
);