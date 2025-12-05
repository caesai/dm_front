import { atom } from 'jotai';
import { IDish } from '@/types/gastronomy.types.ts';

export const gastronomyDishesListAtom = atom<IDish[]>([]);
export const allGastronomyDishesListAtom = atom<IDish[]>([]);