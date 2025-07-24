import { atom } from 'jotai';
import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';

export const guestCountAtom = atom<number>(0);
export const childrenCountAtom = atom<number>(0);

interface ISelectedEvent {
    title?: string;
    id: number;
    startDate?: string;
    endDate?: string;
    price?: number;
}

export const selectedEventAtom = atom<ISelectedEvent | null>(null);

export const eventsListAtom = atom<IEvent[]>([]);
