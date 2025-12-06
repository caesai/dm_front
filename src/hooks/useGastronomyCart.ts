import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { gastronomyCartAtom, ICartItem, IGastronomyCart } from '@/atoms/gastronomyCartAtom.ts';
import { IDish } from '@/types/gastronomy.types.ts';

/**
 * Рассчитывает общие суммы и количество товаров на основе нового списка товаров в корзине.
 * Это чистая функция, которая не изменяет внешнее состояние.
 *
 * @param items - Обновленный список товаров в корзине.
 * @returns Объект, содержащий новый список товаров, общую сумму и общее количество.
 */
const calculateCartTotals = (items: ICartItem[]) => {
    const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, totalAmount, totalItems };
};

/**
 * Применяет логику добавления товара в корзину к предыдущему состоянию.
 * Используется как функция обновления состояния (редьюсер) для Jotai атома.
 *
 * @param prevCart - Предыдущее состояние корзины.
 * @param dish - Объект добавляемого блюда.
 * @param selectedWeightIndex - Индекс выбранного веса/цены блюда.
 * @returns Новое, обновленное состояние корзины.
 */
const handleAddToCartLogic = (prevCart: IGastronomyCart, dish: IDish, selectedWeightIndex: number): IGastronomyCart => {
    // ... (логика функции) ...
    const existingItem = prevCart.items.find((item) => item.id === dish.id);
    const selectedPrice = dish.prices[selectedWeightIndex] ?? dish.prices;
    const selectedWeight = dish.weights[selectedWeightIndex] ?? dish.weights;

    let newItems: ICartItem[];

    if (existingItem) {
        newItems = prevCart.items.map((item) =>
            item.id === dish.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
    } else {
        const newItem: ICartItem = {
            id: dish.id,
            title: dish.title,
            price: selectedPrice,
            quantity: 1,
            weight: selectedWeight,
            weight_value: dish.weight_value,
            image: dish.image_url,
        };
        newItems = [...prevCart.items, newItem];
    }

    return calculateCartTotals(newItems);
};

/**
 * Применяет логику удаления одной единицы товара из корзины к предыдущему состоянию.
 * Используется как функция обновления состояния (редьюсер) для Jotai атома.
 *
 * @param prevCart - Предыдущее состояние корзины.
 * @param dishId - Уникальный идентификатор блюда для удаления.
 * @returns Новое, обновленное состояние корзины.
 */
const handleRemoveFromCartLogic = (prevCart: IGastronomyCart, dishId: number): IGastronomyCart => {
    // ... (логика функции) ...
    const existingItem = prevCart.items.find((item) => item.id === dishId);

    if (!existingItem) {
        return prevCart;
    }

    let newItems: ICartItem[];

    if (existingItem.quantity === 1) {
        newItems = prevCart.items.filter((item) => item.id !== dishId);
    } else {
        newItems = prevCart.items.map((item) =>
            item.id === dishId
                ? { ...item, quantity: item.quantity - 1 }
                : item
        );
    }

    return calculateCartTotals(newItems);
};


/**
 * Хук для управления корзиной гастрономии.
 * Предоставляет доступ к реактивному состоянию корзины (через Jotai)
 * и набору функций-контроллеров для манипулирования этим состоянием.
 *
 * @returns Объект API хука.
 * @returns .cart - Текущее состояние корзины (список товаров, общая сумма, общее количество).
 * @returns .addToCart - Функция для добавления блюда в корзину или увеличения его количества.
 * @returns .removeFromCart - Функция для уменьшения количества блюда в корзине или его полного удаления.
 * @returns .clearCart - Функция для полной очистки корзины.
 * @returns .getItemQuantity - Функция для получения количества определенного блюда в корзине.
 */
export const useGastronomyCart = () => {
    const [cart, setCart] = useAtom(gastronomyCartAtom);

    /**
     * Добавляет блюдо в корзину.
     * Если блюдо уже существует, увеличивает его количество на 1.
     *
     * @param dish - Объект блюда, которое нужно добавить.
     * @param [selectedWeightIndex=0] - Индекс выбранного веса/цены блюда.
     */
    const addToCart = useCallback((dish: IDish, selectedWeightIndex: number = 0) => {
        setCart(prevCart => handleAddToCartLogic(prevCart, dish, selectedWeightIndex));
    }, [setCart]);

    /**
     * Удаляет одну единицу блюда из корзины.
     * Если количество товара становится равным нулю, он полностью удаляется из списка.
     *
     * @param dishId - Уникальный идентификатор блюда для удаления.
     */
    const removeFromCart = useCallback((dishId: number) => {
        setCart(prevCart => handleRemoveFromCartLogic(prevCart, dishId));
    }, [setCart]);

    /**
     * Полностью очищает корзину, сбрасывая все товары, общую сумму и количество в ноль.
     */
    const clearCart = useCallback(() => {
        setCart({
            items: [],
            totalAmount: 0,
            totalItems: 0,
        });
    }, [setCart]);

    /**
     * Возвращает текущее количество определенного блюда в корзине.
     *
     * @param dishId - Уникальный идентификатор блюда.
     * @returns Количество блюда в корзине (0, если блюдо отсутствует).
     */
    const getItemQuantity = useCallback((dishId: number): number => {
        return cart.items.find((item) => item.id === dishId)?.quantity ?? 0;
    }, [cart.items]);

    return {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
    };
};
