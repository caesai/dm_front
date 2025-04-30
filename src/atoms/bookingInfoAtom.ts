import { atom } from 'jotai';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';

interface IBookingInfo {
    restaurantId: number;
    restaurantName: string;
    date: Date;
    timeSlotId: number;
    timeSlotTime: string;
    persons: number;
    commentary: string | undefined;
}

export const bookingAtom = atom<IBookingInfo | null>(null);
export const guestCountAtom = atom<PickerValueObj>({
    title: 'unset',
    value: 'unset',
});
export const bookingDateAtom = atom<PickerValueObj>({
    title: 'unset',
    value: 'unset',
});
export const timeslotAtom = atom<ITimeSlot | null>(null);
