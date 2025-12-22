import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IMenu } from '@/types/menu.types.ts';
/**
 * Получить меню ресторана
 * @param token - Bearer токен для авторизации
 * @param restaurantId - ID ресторана (опционально, если не указан - вернутся меню всех ресторанов)
 */
export const APIGetRestaurantMenu = (token: string, restaurantId?: number) => {
    const params = restaurantId ? { restaurant_id: restaurantId } : {};
    
    return axios.get<IMenu[]>(`${BASE_URL}/maitred/menus`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params,
    });
};

