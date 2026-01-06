import { Atom, atom, useAtomValue } from 'jotai';
import { IRestaurant } from '@/types/restaurant.types.ts';

/**
 * Атом для хранения списка ресторанов
 * @type {Atom<IRestaurant[]>}
 */
export const restaurantsListAtom: Atom<IRestaurant[]> = atom<IRestaurant[]>([]);

/**
 * Получает ресторан по его ID
 * @param {string} restaurantId - ID ресторана
 * @returns {IRestaurant | undefined} Ресторан или undefined если не найден 
 */
export const useGetRestaurantById = (restaurantId: string): IRestaurant | undefined => {
    return useAtomValue(restaurantsListAtom).find((restaurant: IRestaurant) => String(restaurant.id) === restaurantId);
};