import React, { useEffect, useState } from 'react';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { FloatingCartButton } from '@/components/FloatingCartButton/FloatingCartButton.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { IDish } from '@/types/gastronomy.types.ts';
import { APIGetGastronomyDishes } from '@/api/gastronomy.api.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';

export const GastronomyChooseDishesPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const [dishesList, setDishesList] = useState<IDish[]>([]);

    const handleCartClick = () => {
        navigate(`/gastronomy/${res_id}/basket`);
    };

    const handleDishClick = (dish: IDish) => {
        navigate(`/gastronomy/${res_id}/dish/${dish.id}`, {
            state: { dish }
        });
    };

    useEffect(() => {
        if (!auth) return;
        console.log('res_id: ', res_id)
        APIGetGastronomyDishes(auth.access_token, res_id)
            .then((res) => setDishesList(res.data))
            .catch((err) => console.error(err));
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
