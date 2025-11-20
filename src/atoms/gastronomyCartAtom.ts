import { atom } from 'jotai';

export interface ICartItem {
    id: number;
    title: string;
    price: number;
    quantity: number;
    weight: string;
    image: string;
}

export interface IGastronomyCart {
    items: ICartItem[];
    totalAmount: number;
    totalItems: number;
}

export const gastronomyCartAtom = atom<IGastronomyCart>({
    items: [],
    totalAmount: 0,
    totalItems: 0,
});

