import { atom } from 'jotai';
import { currentCityAtom } from '@/atoms/currentCityAtom.ts';

export interface ICity {
    id: number;
    name: string;
    name_english: string;
    name_dative: string;
}

export type TCityList = ICity[];

export const cityListAtom = atom<TCityList>([]);

export const getCurrentCity = atom((get) => {
    const current = get(currentCityAtom);
    const list = get(cityListAtom);
    return list.find((c) => c.name_english == current);
});
