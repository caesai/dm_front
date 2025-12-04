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

/**
 * Форматирует вес, добавляя "г" если единица измерения отсутствует
 */
const formatWeight = (weight: string | undefined): string | undefined => {
    if (!weight) return undefined;
    // Если вес уже содержит единицы измерения (г, кг, л и т.д.), возвращаем как есть
    if (/[а-яА-Яa-zA-Z]/.test(weight)) {
        return weight;
    }
    // Иначе добавляем "г"
    return `${weight} г`;
};

export const GastonomyDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart, getItemQuantity } = useGastronomyCart();

    const [initialDishesList] = useAtom(dishesListAtom);

    const dishFromState = location.state?.dish as IDish;
    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
    const [dishesList, setDishesList] = useState<IDish[]>([]);

    if (!dishFromState) {
        return <div>Блюдо не найдено</div>;
    }

    const quantity = getItemQuantity(dishFromState.id);
    const rawSelectedWeight = dishFromState.weights[selectedWeightIndex] || dishFromState.weights[0];
    const selectedWeight = formatWeight(rawSelectedWeight);
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

    const handleGoToCart = () => {
        navigate(`/gastronomy/${res_id}/basket`);
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
                        {selectedWeight && (
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
                                        {formatWeight(weight)}
                                </button>
                            ))}
                        </div>
                    </div>
                    )}

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Описание</span>
                        <p className={css.sectionText}>
                            {(dishFromState as any).guest_title || dishFromState.description}
                        </p>
                    </div>

                    {(() => {
                        // Данные КБЖУ находятся напрямую в объекте блюда
                        const calories = (dishFromState as any).calories;
                        const proteins = (dishFromState as any).proteins;
                        const fats = (dishFromState as any).fats;
                        const carbohydrates = (dishFromState as any).carbohydrates;
                        
                        // Показываем блок только если есть calories
                        if (!calories && calories !== 0) return null;
                        
                        return (
                    <div className={css.section}>
                        <span className={css.sectionTitle}>На 100 граммов</span>
                        <div className={css.nutritionGrid}>
                            <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>
                                            {calories || '0'}
                                        </span>
                                <span className={css.nutritionLabel}>ккал</span>
                            </div>
                            <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>
                                            {proteins || '0'}
                                        </span>
                                <span className={css.nutritionLabel}>белки</span>
                            </div>
                            <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>
                                            {fats || '0'}
                                        </span>
                                <span className={css.nutritionLabel}>жиры</span>
                            </div>
                            <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>
                                            {carbohydrates || '0'}
                                        </span>
                                <span className={css.nutritionLabel}>углеводы</span>
                            </div>
                        </div>
                    </div>
                        );
                    })()}

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Аллергены</span>
                        <p className={css.sectionText}>
                            {(() => {
                                // Аллергены находятся в поле allergens
                                const allergensArray = (dishFromState as any).allergens;
                                
                                // Проверяем, что это массив и он не пустой
                                if (!allergensArray || !Array.isArray(allergensArray) || allergensArray.length === 0) {
                                    return 'Нет';
                                }
                                
                                const allergenNames: string[] = [];
                                
                                for (const allergen of allergensArray) {
                                    // Если это строка, добавляем напрямую
                                    if (typeof allergen === 'string' && allergen.trim().length > 0) {
                                        allergenNames.push(allergen.trim());
                                    }
                                    // Если это объект, ищем поле с именем
                                    else if (allergen && typeof allergen === 'object' && allergen !== null) {
                                        const name = allergen.name || allergen.title;
                                        if (name && typeof name === 'string' && name.trim().length > 0) {
                                            allergenNames.push(name.trim());
                                        }
                                    }
                                }
                                
                                return allergenNames.length > 0 ? allergenNames.join(', ') : 'Нет';
                            })()}
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
                    <span className={css.counterText} onClick={handleGoToCart} style={{ cursor: 'pointer' }}>
                        {cart.totalAmount} ₽
                    </span>
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
