import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IDish } from '@/types/gastronomy.types.ts';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { DishCard } from '@/components/DishCard/DishCard.tsx';
import { PlusIcon } from '@/components/Icons/PlusIcon.tsx';
import { MinusIcon } from '@/components/Icons/MinusIcon.tsx';
import css from './GastonomyDishDetailsPage.module.css';
import { useAtom } from 'jotai';
import { dishesListAtom } from '@/atoms/dishesListAtom.ts';

export const GastonomyDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const [initialDishesList] = useAtom(dishesListAtom);

    const dishFromState = location.state?.dish as IDish;
    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
    const [dishesList, setDishesList] = useState<IDish[]>([]);

    if (!dishFromState) {
        return <div>Блюдо не найдено</div>;
    }

    const quantity = getItemQuantity(dishFromState.id);
    const selectedWeight = dishFromState.weights[selectedWeightIndex] || dishFromState.weights[0];
    const selectedPrice = dishFromState.prices[selectedWeightIndex] || dishFromState.prices[0];
    const hasMultipleWeights = dishFromState.weights.length > 1;

    const handleAddToCart = () => {
        addToCart(dishFromState, selectedWeightIndex);
    };

    const handleRemoveFromCart = () => {
        removeFromCart(dishFromState.id);
    };

    const handleDishClick = (dish: IDish) => {
        navigate(`/gastronomy/${res_id}/dish/${dish.id}`, {
            state: { dish },
            replace: true
        });
        setSelectedWeightIndex(0);
    };

    // Убираем текущее блюдо из списка всех блюд
    useEffect(() => {
        setDishesList(initialDishesList.filter((dish) => dish.id !== dishFromState.id));
    }, [initialDishesList, dishFromState.id]);

    return (
        <div className={css.page}>
            <div className={css.mainCard}>
                <div className={css.content}>
                    <div
                        className={css.mainImage}
                        style={{ backgroundImage: `url(${dishFromState.image_url})` }}
                    />

                    <div className={css.titleSection}>
                        <div className={css.titleRow}>
                            <h2 className={css.dishTitle}>{dishFromState.title}</h2>
                            <span className={css.dishPrice}>{selectedPrice} ₽</span>
                        </div>
                        {hasMultipleWeights && (
                            <span className={css.selectedWeight}>{selectedWeight}</span>
                        )}
                    </div>

                    {hasMultipleWeights && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Вес</span>
                            <div className={css.weightTags}>
                                {dishFromState.weights.map((weight, index) => (
                                    <button
                                        key={weight}
                                        className={index === selectedWeightIndex ? css.weightTagActive : css.weightTag}
                                        onClick={() => setSelectedWeightIndex(index)}
                                    >
                                        {weight}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Описание</span>
                        <p className={css.sectionText}>
                            {dishFromState.guest_title || dishFromState.description}
                        </p>
                    </div>

                    {dishFromState.nutritionPer100g?.calories && (
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
                    )}

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Аллергены</span>
                        <p className={css.sectionText}>
                            {dishFromState.allergens && dishFromState.allergens.length > 0
                                ? dishFromState.allergens.map((allergen) => allergen.name).join(', ')
                                : 'Нет'}
                        </p>
                    </div>
                </div>
            </div>

            <div className={css.moreSection}>
                <h3 className={css.moreSectionTitle}>Что-нибудь еще?</h3>
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
            </div>

            {quantity > 0 ? (
                <div className={css.floatingCounter}>
                    <button className={css.counterIcon} onClick={handleRemoveFromCart}>
                        <MinusIcon size={28} color="#FFFFFF" />
                    </button>
                    <span className={css.counterText}>{quantity}</span>
                    <button className={css.counterIcon} onClick={handleAddToCart}>
                        <PlusIcon size={28} color="#FFFFFF" />
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
