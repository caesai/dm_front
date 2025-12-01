import { IDish, IOrder } from '@/types/gastronomy.types.ts';

export const NewYearCookingData = {
    description: 'Оформите предзаказ новогодних блюд до 28 декабря и получите готовый стол!',
    image: 'https://storage.yandexcloud.net/bottec-dreamteam/07838462279344c4a775c6e57b74c125.png',
};

export const mockGastronomyListData: IDish[] = [
    {
        id: 1,
        title: 'Крем-суп из пастернака',
        prices: [1300, 2600],
        weights: ['200 г', '600 г'],
        image_url: 'https://shuba.life/static/content/thumbs/1824x912/6/85/rtajoy---c2x1x50px50p-up--2ed4310a341a5cc5f36dfd79e5ed0856.jpg',
        description: 'Крем-суп из пастернака с нежной, слегка сладковатой нотой корнеплодов. Бархатная текстура, деликатный аромат и мягкий сливочный вкус. Отлично согревает и подойдёт как лёгкое, утончённое блюдо.',
        nutritionPer100g: {
            calories: '80-100 ккал',
            proteins: '2-3 г',
            fats: '5-7 г',
            carbs: '8-10 г',
        },
        allergens: [
            { code: 'A1', name: 'молоко' },
            { code: 'B3', name: 'глютен' },
            { code: 'D', name: 'сельдерей' },
            { code: 'E', name: 'чеснок' },
        ],
    },
    {
        id: 2,
        title: 'Салат с авокадо и креветками',
        prices: [1600],
        weights: ['250 г'],
        image_url: 'https://recipes.av.ru//media/recipes/102059_picture_5AuIoAB.jpg',
        description: 'Салат с авокадо и креветками: лёгкий, свежий и сочный. Спелое авокадо, хрустящие овощи и нежные креветки отлично сочетаются между собой. Подойдёт как вкусный вариант для лёгкого обеда или ужина.',
        nutritionPer100g: {
            calories: '120 ккал',
            proteins: '10 г',
            fats: '7 г',
            carbs: '4 г',
        },
        allergens: [
            { code: 'F1', name: 'ракообразные' },
        ],
    },
    {
        id: 3,
        title: 'Ризотто с грибами',
        prices: [1800, 2200],
        weights: ['300 г', '500 г'],
        image_url: 'https://i.ytimg.com/vi/B0ps9wCwkJo/maxresdefault.jpg',
        description: 'Ризотто с грибами: насыщенное, ароматное и очень нежное. Кремовая текстура риса сочетается с вкусом обжаренных грибов и лёгкими нотками сыра. Простое, тёплое и уютное блюдо для любого дня.',
        nutritionPer100g: {
            calories: '150 ккал',
            proteins: '4 г',
            fats: '6 г',
            carbs: '20 г',
        },
        allergens: [
            { code: 'A1', name: 'молоко' },
        ],
    },
];

export const mockOrdersListData: IOrder[] = [
    {
        orderId: '1239233320',
        restaurant_id: 10,
        status: 'paid',
        items: [
            { id: 1, title: 'Крем - суп из пастернака', quantity: 1, price: 1300 },
            { id: 2, title: 'Крем - суп', quantity: 2, price: 1300 },
        ],
        totalAmount: 10000,
        deliveryMethod: 'pickup',
        deliveryCost: 0,
        pickupTime: {
            date: '2025-12-25',
            time: '12:00-15:00',
        },
        createdAt: '2025-12-24T18:00:00Z',
    },
    {
        orderId: '1239233321',
        restaurant_id: 10,
        status: 'paid',
        items: [
            { id: 1, title: 'Крем - суп из пастернака', quantity: 2, price: 1300 },
            { id: 3, title: 'Ризотто с грибами', quantity: 1, price: 1800 },
        ],
        totalAmount: 5200, // 2600 + 1800 + 800 (доставка)
        deliveryMethod: 'delivery',
        deliveryCost: 800,
        deliveryAddress: 'Санкт-Петербург, Московский проспект, 150, кв. 12',
        deliveryTime: {
            date: '2025-12-25',
            time: '15:00-18:00',
        },
        createdAt: '2025-12-24T19:30:00Z',
    },
];

