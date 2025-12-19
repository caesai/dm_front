import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IMenuItem } from '@/types/restaurant.types';
import { IMenuItem as IAPIMenuItem } from '@/api/menu.api';
import { BackIcon } from '@/components/Icons/BackIcon';
import css from './RestaurantDishDetailsPage.module.css';

/**
 * Форматирует вес, добавляя единицу измерения
 */
export const formatWeight = (weight: string | undefined, weight_unit?: string): string | undefined => {
    if (!weight) return undefined;
    if (!weight_unit) return weight;
    return `${weight} ${weight_unit}`;
};

/**
 * Извлекает цену из массива prices
 */
const extractPrice = (prices: any[] | undefined): number => {
    if (!prices || prices.length === 0) return 0;
    
    // Берем первый элемент массива prices
    const priceObj = prices[0];
    if (!priceObj || typeof priceObj !== 'object') return 0;
    
    // Извлекаем значение цены из первого свойства объекта
    // Структура: [{ "additionalProp1": {} }] или [{ "default": { "value": 1000 } }]
    const keys = Object.keys(priceObj);
    if (keys.length === 0) return 0;
    
    const firstKey = keys[0];
    const priceData = priceObj[firstKey];
    
    // Если priceData - число, возвращаем его
    if (typeof priceData === 'number') return priceData;
    
    // Если priceData - объект, ищем поле value, price, amount
    if (typeof priceData === 'object' && priceData !== null) {
        return priceData.value || priceData.price || priceData.amount || 0;
    }
    
    return 0;
};


export const RestaurantDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const dishFromState = location.state?.dish as IMenuItem & {
        description?: string;
        calories?: number | null;
        proteins?: number | null;
        fats?: number | null;
        carbohydrates?: number | null;
        allergens?: string[];
        weights?: string[];
        weight_value?: string;
        volume?: string;
        item_sizes?: IAPIMenuItem['item_sizes'];
    };

    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

    // Текущий выбранный размер
    const currentSize = useMemo(() => {
        if (dishFromState?.item_sizes && dishFromState.item_sizes.length > 0) {
            return dishFromState.item_sizes[selectedWeightIndex] || dishFromState.item_sizes[0];
        }
        return null;
    }, [dishFromState, selectedWeightIndex]);

    // Цена текущего размера
    const currentPrice = useMemo(() => {
        if (currentSize) {
            return extractPrice(currentSize.prices);
        }
        return dishFromState?.price || 0;
    }, [currentSize, dishFromState]);

    if (!dishFromState) {
        return (
            <div className={css.errorContainer}>
                <p>Блюдо не найдено</p>
                <button onClick={() => navigate(-1)}>Назад</button>
            </div>
        );
    }

    // Текущий вес для отображения
    const currentWeight = useMemo(() => {
        const unit = dishFromState.weight_value || '';
        
        if (currentSize) {
            return `${currentSize.portion_weight_grams} ${unit}`.trim();
        }
        if (dishFromState.weights && dishFromState.weights.length > 0) {
            const rawWeight = dishFromState.weights[selectedWeightIndex] || dishFromState.weights[0];
            return formatWeight(rawWeight, unit);
        }
        return undefined;
    }, [currentSize, dishFromState, selectedWeightIndex]);

    const hasMultipleWeights = dishFromState?.item_sizes && dishFromState.item_sizes.length > 1;

    const handleBookTable = () => {
        navigate(`/restaurant/${id}/booking`);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={css.page}>
            {/* Основная карточка */}
            <div className={css.mainCard}>
                {/* Header с кнопкой назад */}
                <div className={css.header}>
                    <button className={css.backButton} onClick={handleGoBack}>
                        <BackIcon />
                    </button>
                    <h1 className={css.headerTitle}>{dishFromState.title}</h1>
                    <div className={css.spacer} />
                </div>

                {/* Контент */}
                <div className={css.content}>
                    {/* Изображение */}
                    <div 
                        className={css.mainImage} 
                        style={{ 
                            backgroundImage: dishFromState.photo_url 
                                ? `url(${dishFromState.photo_url})` 
                                : 'none',
                            backgroundColor: dishFromState.photo_url ? 'transparent' : '#F4F4F4'
                        }} 
                    />

                    {/* Название и цена */}
                    <div className={css.titleSection}>
                        <div className={css.titleRow}>
                            <h2 className={css.dishTitle}>{dishFromState.title}</h2>
                            <span className={css.dishPrice}>{currentPrice} ₽</span>
                        </div>
                        {currentWeight && <span className={css.selectedWeight}>{currentWeight}</span>}
                    </div>

                    {/* Выбор веса (если есть несколько вариантов) */}
                    {hasMultipleWeights && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Вес</span>
                            <div className={css.weightTags}>
                                {dishFromState.item_sizes!.map((size, index) => (
                                    <button
                                        key={size.id}
                                        className={index === selectedWeightIndex ? css.weightTagActive : css.weightTag}
                                        onClick={() => setSelectedWeightIndex(index)}
                                    >
                                        {size.portion_weight_grams} {dishFromState.weight_value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Описание/состав */}
                    {dishFromState.description && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Состав</span>
                            <p className={css.sectionText}>
                                {dishFromState.description}
                            </p>
                        </div>
                    )}

                    {/* КБЖУ */}
                    {(dishFromState.calories !== null || dishFromState.proteins !== null || 
                      dishFromState.fats !== null || dishFromState.carbohydrates !== null) && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>На 100 граммов</span>
                            <div className={css.nutritionGrid}>
                                {dishFromState.calories !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{Math.round(dishFromState.calories)}</span>
                                        <span className={css.nutritionLabel}>ккал</span>
                                    </div>
                                )}
                                {dishFromState.proteins !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{Math.round(dishFromState.proteins)}</span>
                                        <span className={css.nutritionLabel}>белки</span>
                                    </div>
                                )}
                                {dishFromState.fats !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{Math.round(dishFromState.fats)}</span>
                                        <span className={css.nutritionLabel}>жиры</span>
                                    </div>
                                )}
                                {dishFromState.carbohydrates !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{Math.round(dishFromState.carbohydrates)}</span>
                                        <span className={css.nutritionLabel}>углеводы</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Аллергены */}
                    <div className={css.section}>
                        <span className={css.sectionTitle}>Аллергены</span>
                        <p className={css.sectionText}>
                            {(() => {
                                const allergensArray = dishFromState.allergens;

                                if (!allergensArray || !Array.isArray(allergensArray) || allergensArray.length === 0) {
                                    return 'Нет';
                                }

                                const allergenNames: string[] = [];

                                for (const allergen of allergensArray) {
                                    if (typeof allergen === 'string' && allergen.trim().length > 0) {
                                        allergenNames.push(allergen.trim());
                                    } else if (allergen && typeof allergen === 'object' && allergen !== null) {
                                        const name = (allergen as any).name || (allergen as any).title;
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

            {/* Кнопка бронирования */}
            <div className={css.buttonContainer}>
                <button className={css.bookButton} onClick={handleBookTable}>
                    Забронировать стол
                </button>
            </div>
        </div>
    );
};

