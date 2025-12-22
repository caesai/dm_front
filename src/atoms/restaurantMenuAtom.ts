import { atom } from 'jotai';
// Types
import { IMenu } from '@/types/menu.types.ts';

/**
 * Атом для хранения кешированных меню ресторанов
 * Ключ - ID ресторана, значение - меню
 */
export const restaurantMenusAtom = atom<Record<number, IMenu>>({});

