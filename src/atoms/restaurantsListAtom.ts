import { Atom, atom, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { IRestaurant } from '@/types/restaurant.types.ts';

/**
 * Атом для хранения списка ресторанов
 * @type {Atom<IRestaurant[]>}
 */
export const restaurantsListAtom: Atom<IRestaurant[]> = atom<IRestaurant[]>([]);

/**
 * Мемоизированный атом для получения ресторана по ID
 * Использует atomFamily для кэширования результатов поиска
 * @param {string} restaurantId - ID ресторана
 */
export const restaurantByIdAtom = atomFamily((restaurantId: string) =>
    atom((get) => {
        const restaurants = get(restaurantsListAtom);
        return restaurants.find((restaurant: IRestaurant) => String(restaurant.id) === restaurantId);
    })
);

/**
 * Получает ресторан по его ID
 * @param {string} restaurantId - ID ресторана
 * @returns {IRestaurant | undefined} Ресторан или undefined если не найден 
 */
export const useGetRestaurantById = (restaurantId: string): IRestaurant | undefined => {
    return useAtomValue(restaurantByIdAtom(restaurantId));
};