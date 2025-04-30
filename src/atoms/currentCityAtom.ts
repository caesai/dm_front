import { atom } from 'jotai';

export const currentCityAtom = atom(
    localStorage.getItem('currentCity') ?? 'moscow'
);

export const setCurrentCityAtom = atom(
    (get) => {
        get(currentCityAtom);
    },
    (_get, set, newVal: string) => {
        set(currentCityAtom, newVal);
        localStorage.setItem('currentCity', newVal);
    }
);
