import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom';
import { restaurantMenusAtom } from '@/atoms/restaurantMenuAtom';
import { APIGetRestaurantMenu, IMenu } from '@/api/menu.api';

export const useRestaurantMenu = (restaurantId: number | undefined) => {
    const [auth] = useAtom(authAtom);
    const [restaurantMenus, setRestaurantMenus] = useAtom(restaurantMenusAtom);
    const [menuData, setMenuData] = useState<IMenu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!auth?.access_token || !restaurantId) return;

        if (restaurantMenus[restaurantId]) {
            setMenuData(restaurantMenus[restaurantId]);
            setLoading(false);
            return;
        }

        setLoading(true);
        APIGetRestaurantMenu(auth.access_token, restaurantId)
            .then((response) => {
                const menu = response.data[0];
                setMenuData(menu);
                setRestaurantMenus(prev => ({
                    ...prev,
                    [restaurantId]: menu
                }));
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [auth?.access_token, restaurantId, restaurantMenus, setRestaurantMenus]);

    const refetch = () => {
        setError(false);
        setLoading(true);
        setRestaurantMenus(prev => {
            const newMenus = { ...prev };
            if (restaurantId) delete newMenus[restaurantId];
            return newMenus;
        });
    };

    return { menuData, loading, error, refetch };
};

