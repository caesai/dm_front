import { atom } from 'jotai';
import { IRestaurant } from '@/types/restaurant.ts';

export const restaurantsListAtom = atom<IRestaurant[]>([]);
