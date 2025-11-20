import { useAtom } from 'jotai';
import { gastronomyCartAtom, ICartItem } from '@/atoms/gastronomyCartAtom.ts';
import { IDish } from '@/types/gastronomy.types.ts';

export const useGastronomyCart = () => {
    const [cart, setCart] = useAtom(gastronomyCartAtom);

    const addToCart = (dish: IDish) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((item) => item.id === dish.id);
            
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
                        price: dish.price,
                        quantity: 1,
                        weight: dish.defaultWeight,
                        image: dish.image,
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

    const removeFromCart = (dishId: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((item) => item.id === dishId);
            
            if (!existingItem) return prevCart;

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

    const clearCart = () => {
        setCart({
            items: [],
            totalAmount: 0,
            totalItems: 0,
        });
    };

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

