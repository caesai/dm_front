import { atom } from 'jotai';

const bookingCommAtom = atom<string[]>([]);

export const commAtom = atom(
    (get) => get(bookingCommAtom),
    (get, set, value: string) => {
        const currentState = get(bookingCommAtom);
        currentState.includes(value)
            ? set(
                  bookingCommAtom,
                  currentState.filter((v) => v !== value)
              )
            : set(bookingCommAtom, [...currentState, value]);
    }
);
