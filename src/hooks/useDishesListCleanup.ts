import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai/index';
import { dishesListAtom } from '@/atoms/dishesListAtom.ts';

export const useDishesListCleanup = () => {
    const [, setDishesList] = useAtom(dishesListAtom);

    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.includes('gastronomy')) {
            setDishesList([]);
        }
    }, [location.pathname]);
}