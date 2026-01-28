import { atom } from 'jotai';

/**
 * Атом для отслеживания состояния скролла на странице ресторана.
 * `true` — страница прокручена достаточно для показа навигации в хедере.
 *
 * @constant headerScrolledAtom
 */
export const headerScrolledAtom = atom<boolean>(false);

