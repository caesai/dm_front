import { useAtom } from 'jotai';
import { gastronomyCartAtom, ICartItem } from '@/atoms/gastronomyCartAtom.ts';
import { IDish } from '@/types/gastronomy.types.ts';

/**
 * Хук для управления корзиной кулинарии.
 * Предоставляет доступ к состоянию корзины и функциям для добавления,
 * удаления и очистки товаров.
 *
 * @returns {object} Объект, содержащий состояние корзины и методы управления ею.
 * @returns {object} .cart - Текущее состояние корзины (items, totalAmount, totalItems).
 * @returns {function} .addToCart - Функция для добавления блюда в корзину.
 * @returns {function} .removeFromCart - Функция для удаления единицы блюда из корзины.
 * @returns {function} .clearCart - Функция для полной очистки корзины.
 * @returns {function} .getItemQuantity - Функция для получения количества определенного блюда в корзине.
 */
export const useGastronomyCart = () => {
    const [cart, setCart] = useAtom(gastronomyCartAtom);

    /**
     * Добавляет блюдо в корзину.
     * Если блюдо уже существует, увеличивает его количество на 1.
     * Автоматически обновляет общую сумму и количество товаров в корзине.
     *
     * @param {IDish} dish - Объект блюда, которое нужно добавить.
     * @param {number} [selectedWeightIndex=0] - Индекс выбранного веса/цены блюда.
     */
    const addToCart = (dish: IDish, selectedWeightIndex: number = 0) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((item) => item.id === dish.id);
            // ... (остальная логика addToCart) ...
            const selectedPrice = dish.prices[selectedWeightIndex] || dish.prices[0];
            const selectedWeight = dish.weights[selectedWeightIndex] || dish.weights[0];

            let newItems: ICartItem[];
            if (existingItem) {
                newItems = prevCart.items.map((item) =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newItems = [
                    ...prevCart.items,
                    {
                        id: dish.id,
                        title: dish.title,
                        price: selectedPrice,
                        quantity: 1,
                        weight: selectedWeight,
                        image: dish.image_url,
                    },
                ];
            }

            const totalAmount = newItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: newItems,
                totalAmount,
                totalItems,
            };
        });
    };

    /**
     * Удаляет одну единицу блюда из корзины.
     * Если количество товара становится равным нулю, он полностью удаляется из списка.
     * Если блюда нет в корзине, ничего не происходит.
     * Автоматически обновляет общую сумму и количество товаров в корзине.
     *
     * @param {number} dishId - Уникальный идентификатор блюда для удаления.
     */
    const removeFromCart = (dishId: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((item) => item.id === dishId);

            if (!existingItem) return prevCart;

            // ... (остальная логика removeFromCart) ...
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

            const totalAmount = newItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: newItems,
                totalAmount,
                totalItems,
            };
        });
    };

    /**
     * Полностью очищает корзину, сбрасывая все товары, общую сумму и количество в ноль.
     */
    const clearCart = () => {
        setCart({
            items: [],
            totalAmount: 0,
            totalItems: 0,
        });
    };

    /**
     * Возвращает текущее количество определенного блюда в корзине.
     *
     * @param {number} dishId - Уникальный идентификатор блюда.
     * @returns {number} Количество блюда в корзине (0, если блюдо отсутствует).
     */
    const getItemQuantity = (dishId: number): number => {
        const item = cart.items.find((item) => item.id === dishId);
        return item ? item.quantity : 0;
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
    };
};
