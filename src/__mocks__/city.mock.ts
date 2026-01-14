import { ICity } from '@/atoms/cityListAtom.ts';

/**
 * Список городов для тестов.
 * Содержит Москву и Санкт-Петербург.
 */
export const mockCityList: ICity[] = [
    { id: 1, name: 'Москва', name_english: 'moscow', name_dative: 'Москве' },
    { id: 2, name: 'Санкт-Петербург', name_english: 'spb', name_dative: 'Санкт-Петербурге' },
];

/**
 * Город по умолчанию (СПб).
 */
export const defaultCity = mockCityList[1];
