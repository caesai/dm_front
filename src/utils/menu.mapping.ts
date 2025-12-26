import { IMenuItem as IAPIMenuItem } from '@/types/menu.types.ts';
import { IMenuItem } from '@/types/restaurant.types.ts';
import { extractPrice, getDefaultSize } from './menu.utils';

/**
 * Маппит элемент меню из API в формат для страницы деталей блюда
 * @param dish - Элемент меню из API
 * @param menuData - Данные меню (для определения категории коктейлей)
 * @param firstDishImage - URL изображения первого блюда с картинкой (для коктейлей)
 * @param isCocktailCategory - Функция для проверки, является ли категория коктейльной
 * @returns Объект с данными блюда для страницы деталей
 */
export const mapApiMenuItemToDishState = (
    dish: IAPIMenuItem,
    menuData: { item_categories: Array<{ id: string; name: string }> } | null | undefined,
    firstDishImage: string,
    isCocktailCategory: (categoryName: string) => boolean
): IMenuItem & {
    description?: string;
    composition?: string;
    calories?: number | null;
    proteins?: number | null;
    fats?: number | null;
    carbohydrates?: number | null;
    allergens?: string[];
    weights?: string[];
    weight_value?: string;
    item_sizes?: IAPIMenuItem['item_sizes'];
    isCocktail?: boolean;
} => {
    const defaultSize = getDefaultSize(dish.item_sizes);
    const price = extractPrice(defaultSize?.prices);

    const nutrition = defaultSize?.nutrition_per_hundred;
    const calories = nutrition?.calories || nutrition?.energy || null;
    const proteins = nutrition?.proteins || nutrition?.protein || null;
    const fats = nutrition?.fats || nutrition?.fat || null;
    const carbohydrates = nutrition?.carbohydrates || nutrition?.carbs || null;

    const isCocktail = isCocktailCategory(
        menuData?.item_categories.find((cat) => cat.id === dish.category_id)?.name || ''
    );
    
    // Для коктейлей используем изображение первого блюда с картинкой из меню
    const cocktailImageUrl = isCocktail ? firstDishImage : '';
    const photoUrl = isCocktail && cocktailImageUrl ? cocktailImageUrl : (defaultSize?.button_image_url || '');

    return {
        id: parseInt(dish.id) || 0,
        title: dish.name,
        photo_url: photoUrl,
        price: price,
        // Используем поля из API напрямую, без fallback
        // Если есть guest_description - используем его, иначе description (если есть)
        description: dish.guest_description || (dish.description ? dish.description : undefined),
        // Используем composition из API (если есть)
        composition: dish.composition,
        calories,
        proteins,
        fats,
        carbohydrates,
        allergens: dish.allergens
            ?.map((a) => {
                if (typeof a === 'string') return a;
                if (a && typeof a === 'object') {
                    return (
                        a.name ||
                        a.title ||
                        a.value ||
                        Object.values(a).find((v) => typeof v === 'string' && v.length > 0 && !/^[A-Z]\d+$/.test(v))
                    );
                }
                return null;
            })
            .filter(Boolean) as string[],
        weights: dish.item_sizes.filter((s) => !s.is_hidden).map((s) => s.portion_weight_grams.toString()),
        weight_value: dish.measure_unit || defaultSize?.measure_unit_type || '',
        item_sizes: dish.item_sizes.filter((s) => !s.is_hidden),
        isCocktail: isCocktail,
    };
};

