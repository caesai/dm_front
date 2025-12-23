import { IMenu, IMenuCategory, IMenuItem, IMenuItemSize } from '@/types/menu.types.ts';

/**
 * Замоканные данные для коктейлей
 * Используются для тестирования функциональности блюра и модального окна подтверждения возраста
 */

// Размеры коктейлей
const createCocktailSize = (
    id: string,
    portionWeight: number,
    price: number,
    isDefault: boolean = false
): IMenuItemSize => ({
    id,
    item_id: '',
    restaurant_id: 0,
    sku: `cocktail-${id}`,
    size_code: 'default',
    size_name: 'По умолчанию',
    size_id: id,
    is_default: isDefault,
    is_hidden: false,
    portion_weight_grams: portionWeight,
    measure_unit_type: 'мл',
    button_image_url: '/img/cocktails/negroni.png', // Используем изображение для демонстрации
    prices: [{ default: price }],
});

// Создание коктейля
const createCocktail = (
    id: string,
    name: string,
    description: string,
    volume: number,
    price: number,
    imagePath: string
): IMenuItem => ({
    id,
    category_id: 'cocktail-category',
    restaurant_id: 0,
    sku: `cocktail-${id}`,
    name,
    description,
    type: 'cocktail',
    measure_unit: 'мл',
    allergens: [],
    tags: [],
    labels: [],
    is_hidden: false,
    can_be_divided: false,
    item_sizes: [createCocktailSize(`${id}-size`, volume, price, true)],
});

// Категория замоканных коктейлей для демонстрации
export const mockCocktailCategory: IMenuCategory = {
    id: 'mock-cocktail-category',
    menu_id: 'mock-menu',
    restaurant_id: 0,
    name: 'Замоканные коктейли',
    description: 'Алкогольные коктейли для демонстрации функциональности',
    button_image_url: '',
    header_image_url: '',
    is_hidden: false,
    tags: [],
    labels: [],
    menu_items: [
        createCocktail('1', 'Негрони', 'Классический итальянский коктейль с джином, вермутом и кампари', 200, 1300, '/img/cocktails/negroni.png'),
        createCocktail('2', 'Маргарита', 'Мексиканский коктейль с текилой, лаймом и трипл-секом', 200, 1200, '/img/cocktails/margarita.png'),
        createCocktail('3', 'Мохито Классик', 'Освежающий коктейль с белым ромом, мятой и лаймом', 250, 1100, '/img/cocktails/mojito-classic.png'),
        createCocktail('4', 'Вишневое наслаждение', 'Сладкий коктейль с вишней и виски', 200, 1400, '/img/cocktails/cherry-delight.png'),
    ],
};
