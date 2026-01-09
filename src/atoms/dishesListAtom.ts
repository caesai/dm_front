import { Atom, atom } from 'jotai';
import { IDish } from '@/types/gastronomy.types.ts';

/**
 * Атом для хранения списка блюд
 * @type {Atom<IDish[]>}
 */
export const gastronomyDishesListAtom: Atom<IDish[]> = atom<IDish[]>([]);

/**
 * Атом для хранения всех блюд
 * @type {Atom<IDish[]>}
 */
export const allGastronomyDishesListAtom: Atom<IDish[]> = atom<IDish[]>([]);