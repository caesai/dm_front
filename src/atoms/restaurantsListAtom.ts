import { atom } from 'jotai';
import { IRestaurant } from '@/types/restaurant.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';

export const restaurantsListAtom = atom<IRestaurant[]>([]);
export const bookingRestaurantAtom = atom<PickerValueObj>({
    title: 'unset',
    value: 'unset',
});
