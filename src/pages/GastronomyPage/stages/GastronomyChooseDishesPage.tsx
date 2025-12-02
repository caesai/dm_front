import React, { useEffect } from 'react';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { FloatingCartButton } from '@/components/FloatingCartButton/FloatingCartButton.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { IDish } from '@/types/gastronomy.types.ts';
import { APIGetGastronomyDishes } from '@/api/gastronomy.api.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { dishesListAtom } from '@/atoms/dishesListAtom.ts';

export const GastronomyChooseDishesPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const [dishesList, setDishesList] = useAtom(dishesListAtom);

    // Логирование при рендере компонента
    console.log('[GastronomyChooseDishesPage] Component rendered', { 
        dishesCount: dishesList.length, 
        res_id,
        hasAuth: !!auth 
    });

    const handleCartClick = () => {
        navigate(`/gastronomy/${res_id}/basket`);
    };

    const handleDishClick = (dish: IDish) => {
        navigate(`/gastronomy/${res_id}/dish/${dish.id}`, {
            state: { dish }
        });
    };

    useEffect(() => {
        console.log('[GastronomyChooseDishesPage] useEffect triggered', { auth: !!auth, res_id });
        if (!auth) {
            console.log('[GastronomyChooseDishesPage] No auth, returning');
            return;
        }
        console.log('[GastronomyChooseDishesPage] Fetching dishes...');
        APIGetGastronomyDishes(auth.access_token, res_id)
            .then((res) => {
                console.log('[GastronomyChooseDishesPage] Dishes received from API:', res.data);
                console.log('[GastronomyChooseDishesPage] Total dishes:', res.data.length);
                
                // Логирование данных с API для проверки аллергенов
                res.data.forEach((dish, index) => {
                    const allergenInfo = {
                        allergens: dish.allergens,
                        allergensRaw: JSON.stringify(dish.allergens),
                        allergensLength: dish.allergens?.length,
                        allergensType: typeof dish.allergens,
                        isArray: Array.isArray(dish.allergens),
                        allergensDetails: dish.allergens?.map((a: any, i: number) => ({
                            index: i,
                            allergen: a,
                            name: a?.name,
                            code: a?.code,
                            nameType: typeof a?.name,
                            nameLength: a?.name?.length,
                        })),
                    };
                    console.log(`[GastronomyChooseDishesPage] Dish ${index + 1} (ID: ${dish.id}, Title: ${dish.title}):`, allergenInfo);
                });
                setDishesList(res.data);
            })
            .catch((err) => {
                console.error('[GastronomyChooseDishesPage] Error fetching dishes:', err);
            });
    }, [auth, res_id]);

    return (
        <>
            <div className={css.items}>
                {dishesList.map((dish) => (
                    <DishCard
                        key={dish.id}
                        {...dish}
                        quantity={getItemQuantity(dish.id)}
                        onAdd={() => addToCart(dish)}
                        onRemove={() => removeFromCart(dish.id)}
                        onClick={() => handleDishClick(dish)}
                    />
                ))}
            </div>
            {cart.totalItems > 0 && (
                <FloatingCartButton
                    totalAmount={cart.totalAmount}
                    onClick={handleCartClick}
                />
            )}
        </>
    );
};
