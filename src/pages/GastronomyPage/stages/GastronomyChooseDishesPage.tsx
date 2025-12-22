import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// Types
import { IDish } from '@/types/gastronomy.types.ts';
// APIs
import { APIGetGastronomyDishesList } from '@/api/gastronomy.api.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import { gastronomyDishesListAtom } from '@/atoms/dishesListAtom.ts';
// Components
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import { FloatingCartButton } from '@/components/FloatingCartButton/FloatingCartButton.tsx';
// Hooks
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
// Styles
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';

export const GastronomyChooseDishesPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const [dishesList, setDishesList] = useAtom(gastronomyDishesListAtom);

    const handleCartClick = () => {
        navigate(`/gastronomy/${res_id}/basket`);
    };

    const handleDishClick = (dish: IDish) => {
        navigate(`/gastronomy/${res_id}/dish/${dish.id}`, {
            state: { dish },
        });
    };

    useEffect(() => {
        if (!auth) {
            return;
        }
        APIGetGastronomyDishesList(auth.access_token, res_id)
            .then((res) => {
                setDishesList(res.data);
            })
            .catch((error) => {
                console.error(error);
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
            {cart.totalItems > 0 && <FloatingCartButton totalAmount={cart.totalAmount} onClick={handleCartClick} />}
        </>
    );
};
