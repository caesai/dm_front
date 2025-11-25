import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IDish } from '@/types/gastronomy.types.ts';
import { mockGastronomyListData } from '@/__mocks__/gastronomy.mock.ts';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import css from './GastonomyDishDetailsPage.module.css';

export const GastonomyDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const dishFromState = location.state?.dish as IDish;
    const [selectedWeight, setSelectedWeight] = useState(dishFromState?.defaultWeight || '');

    if (!dishFromState) {
        return <div>Блюдо не найдено</div>;
    }

    const quantity = getItemQuantity(dishFromState.id);

    const handleAddToCart = () => {
        addToCart(dishFromState);
    };

    const handleRemoveFromCart = () => {
        removeFromCart(dishFromState.id);
    };

    const handleDishClick = (dish: IDish) => {
        navigate(`/gastronomy/${res_id}/dish/${dish.id}`, {
            state: { dish },
            replace: true
        });
        setSelectedWeight(dish.defaultWeight);
    };

    // Размножаем данные для списка внизу
    const expandedData: IDish[] = [];
    for (let i = 0; i < 10; i++) {
        mockGastronomyListData.forEach((dish) => {
            expandedData.push({
                ...dish,
                id: i * mockGastronomyListData.length + dish.id,
            });
        });
    }

    return (
        <div className={css.page}>
            <div className={css.mainCard}>
                <div className={css.content}>
                    <div
                        className={css.mainImage}
                        style={{ backgroundImage: `url(${dishFromState.image})` }}
                    />

                    <div className={css.titleSection}>
                        <div className={css.titleRow}>
                            <h2 className={css.dishTitle}>{dishFromState.title}</h2>
                            <span className={css.dishPrice}>{dishFromState.price} ₽</span>
                        </div>
                        <span className={css.selectedWeight}>{selectedWeight}</span>
                    </div>

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Вес</span>
                        <div className={css.weightTags}>
                            {dishFromState.weights.map((weight) => (
                                <button
                                    key={weight}
                                    className={weight === selectedWeight ? css.weightTagActive : css.weightTag}
                                    onClick={() => setSelectedWeight(weight)}
                                >
                                    {weight}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Состав</span>
                        <p className={css.sectionText}>
                            {dishFromState.composition.join(', ')}.
                        </p>
                    </div>

                    <div className={css.section}>
                        <span className={css.sectionTitle}>На 100 граммов</span>
                        <div className={css.nutritionGrid}>
                            <div className={css.nutritionItem}>
                                <span className={css.nutritionValue}>{dishFromState.nutritionPer100g.calories}</span>
                                <span className={css.nutritionLabel}>ккал</span>
                            </div>
                            <div className={css.nutritionItem}>
                                <span className={css.nutritionValue}>{dishFromState.nutritionPer100g.proteins}</span>
                                <span className={css.nutritionLabel}>белки</span>
                            </div>
                            <div className={css.nutritionItem}>
                                <span className={css.nutritionValue}>{dishFromState.nutritionPer100g.fats}</span>
                                <span className={css.nutritionLabel}>жиры</span>
                            </div>
                            <div className={css.nutritionItem}>
                                <span className={css.nutritionValue}>{dishFromState.nutritionPer100g.carbs}</span>
                                <span className={css.nutritionLabel}>углеводы</span>
                            </div>
                        </div>
                    </div>

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Аллергены</span>
                        <p className={css.sectionText}>
                            {dishFromState.allergens.map((allergen, index) => (
                                <span key={allergen.code}>
                                    {allergen.code} – {allergen.name}
                                    {index < dishFromState.allergens.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            </div>

            <div className={css.moreSection}>
                <h3 className={css.moreSectionTitle}>Что-нибудь еще?</h3>
                <div className={css.items}>
                    {expandedData.map((dish) => (
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
            </div>

            {quantity > 0 ? (
                <div className={css.floatingCounter}>
                    <button className={css.counterIcon} onClick={handleRemoveFromCart}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 12H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <span className={css.counterText}>{quantity}</span>
                    <button className={css.counterIcon} onClick={handleAddToCart}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4V20M4 12H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            ) : (
                <div className={css.buttonContainer}>
                    <button className={css.addButton} onClick={handleAddToCart}>
                        Добавить в корзину
                    </button>
                </div>
            )}
        </div>
    );
};
