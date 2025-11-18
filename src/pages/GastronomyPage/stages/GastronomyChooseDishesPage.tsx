import React from 'react';
import { mockGastronomyListData } from '@/__mocks__/gastronomy.mock.ts';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { FloatingCartButton } from '@/components/FloatingCartButton/FloatingCartButton.tsx';
import { useNavigate, useParams } from 'react-router-dom';

export const GastronomyChooseDishesPage: React.FC = () => {
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const handleCartClick = () => {
        navigate(`/gastronomy/${res_id}/basket`);
    };

    // Размножаем данные до 30 элементов
    const expandedData = [];
    for (let i = 0; i < 10; i++) {
        mockGastronomyListData.forEach((dish, index) => {
            expandedData.push({
                ...dish,
                id: i * mockGastronomyListData.length + dish.id,
            });
        });
    }

    return (
        <>
            <div className={css.items}>
                {expandedData.map((dish) => (
                    <DishCard
                        key={dish.id}
                        {...dish}
                        quantity={getItemQuantity(dish.id)}
                        onAdd={() => addToCart(dish)}
                        onRemove={() => removeFromCart(dish.id)}
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
