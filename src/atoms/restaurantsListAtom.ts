import { atom } from 'jotai';
import { IRestaurant } from '@/types/restaurant.types.ts';

export const restaurantsListAtom = atom<IRestaurant[]>([]);
