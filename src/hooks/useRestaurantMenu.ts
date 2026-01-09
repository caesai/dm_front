import { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import { restaurantMenusAtom } from '@/atoms/restaurantMenuAtom.ts';
// API
import { APIGetRestaurantMenu } from '@/api/menu.api.ts';
// Types
import { IMenu } from '@/types/menu.types.ts';
// Mocks
import { mockCocktailCategory } from '@/__mocks__/cocktails.mock.ts';

export const useRestaurantMenu = (restaurantId: string) => {
    const [auth] = useAtom(authAtom);
    const [restaurantMenus, setRestaurantMenus] = useAtom(restaurantMenusAtom);
    const [menuData, setMenuData] = useState<IMenu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    // Функция для добавления замоканных коктейлей к меню
    const addMockCocktails = useCallback((menu: IMenu | null): IMenu | null => {
        if (!menu) return null;

        // Проверяем, есть ли уже категория "Замоканные коктейли" в меню
        const hasMockCocktailCategory = menu.item_categories.some(
            cat => cat.name === 'Замоканные коктейли'
        );

        // Добавляем категорию "Замоканные коктейли" для демонстрации, если её ещё нет
        if (!hasMockCocktailCategory) {
            // Создаем копию категории с уникальными ID
            const cocktailCategory = {
                ...mockCocktailCategory,
                id: `mock-cocktail-category-${menu.id}`,
                menu_id: menu.id,
                restaurant_id: menu.restaurant_id,
                menu_items: mockCocktailCategory.menu_items.map((item, index) => ({
                    ...item,
                    id: `mock-cocktail-${menu.id}-${index + 1}`,
                    category_id: `mock-cocktail-category-${menu.id}`,
                    restaurant_id: menu.restaurant_id,
                    item_sizes: item.item_sizes.map((size, sizeIndex) => ({
                        ...size,
                        id: `mock-cocktail-${menu.id}-${index + 1}-size-${sizeIndex}`,
                        item_id: `mock-cocktail-${menu.id}-${index + 1}`,
                        restaurant_id: menu.restaurant_id,
                    })),
                })),
            };

            return {
                ...menu,
                item_categories: [...menu.item_categories, cocktailCategory],
            };
        }

        return menu;
    }, []);

    useEffect(() => {
        if (!auth?.access_token || !restaurantId) return;

        if (restaurantMenus[restaurantId]) {
            const menuWithCocktails = addMockCocktails(restaurantMenus[restaurantId]);
            setMenuData(menuWithCocktails);
            setLoading(false);
            return;
        }

        setLoading(true);
        APIGetRestaurantMenu(auth.access_token, restaurantId)
            .then((response) => {
                const menu = response.data[0];
                const menuWithCocktails = addMockCocktails(menu);
                setMenuData(menuWithCocktails);
                if (menuWithCocktails) {
                    setRestaurantMenus((prev) => ({
                        ...prev,
                        [restaurantId]: menuWithCocktails, // Сохраняем меню с замоканными коктейлями в кеш
                    }));
                }
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [auth?.access_token, restaurantId, restaurantMenus, setRestaurantMenus, addMockCocktails]);

    const refetch = () => {
        setError(false);
        setLoading(true);
        setRestaurantMenus((prev) => {
            const newMenus = { ...prev };
            if (restaurantId) delete newMenus[restaurantId];
            return newMenus;
        });
    };

    return { menuData, loading, error, refetch };
};
