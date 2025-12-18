import { atom } from 'jotai';
import { IMenu } from '@/api/menu.api';

/**
 * Атом для хранения кешированных меню ресторанов
 * Ключ - ID ресторана, значение - меню
 */
export const restaurantMenusAtom = atom<Record<number, IMenu>>({});

