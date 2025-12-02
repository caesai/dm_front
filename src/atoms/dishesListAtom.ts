import { atom } from 'jotai';
import { IDish } from '@/types/gastronomy.types.ts';

export const dishesListAtom = atom<IDish[]>([]);