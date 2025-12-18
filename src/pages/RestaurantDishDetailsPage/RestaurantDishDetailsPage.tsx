import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IMenuItem } from '@/types/restaurant.types';
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

export const RestaurantDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const dishFromState = location.state?.dish as IMenuItem & {
        description?: string;
        calories?: number;
        proteins?: number;
        fats?: number;
        carbohydrates?: number;
        allergens?: string[];
        weights?: string[];
        weight_value?: string;
        volume?: string;
    };

    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

    if (!dishFromState) {
        return (
            <div className={css.errorContainer}>
                <p>Блюдо не найдено</p>
                <button onClick={() => navigate(-1)}>Назад</button>
            </div>
        );
    }

    // Определяем вес/объем для отображения
    const getDisplayWeight = () => {
        if (dishFromState.weights && dishFromState.weights.length > 0) {
            const rawWeight = dishFromState.weights[selectedWeightIndex] || dishFromState.weights[0];
            return formatWeight(rawWeight, dishFromState.weight_value);
        }
        if (dishFromState.volume) {
            return dishFromState.volume;
        }
        return undefined;
    };

    const selectedWeight = getDisplayWeight();
    const hasMultipleWeights = dishFromState.weights && dishFromState.weights.length > 1;

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
                            <span className={css.dishPrice}>{dishFromState.price} ₽</span>
                        </div>
                        {selectedWeight && <span className={css.selectedWeight}>{selectedWeight}</span>}
                    </div>

                    {/* Выбор веса (если есть несколько вариантов) */}
                    {hasMultipleWeights && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Вес</span>
                            <div className={css.weightTags}>
                                {dishFromState.weights!.map((weight, index) => (
                                    <button
                                        key={weight}
                                        className={index === selectedWeightIndex ? css.weightTagActive : css.weightTag}
                                        onClick={() => setSelectedWeightIndex(index)}
                                    >
                                        {formatWeight(weight, dishFromState.weight_value)}
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
                    {dishFromState.calories !== undefined && dishFromState.calories !== null && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>На 100 граммов</span>
                            <div className={css.nutritionGrid}>
                                <div className={css.nutritionItem}>
                                    <span className={css.nutritionValue}>{dishFromState.calories || '0'}</span>
                                    <span className={css.nutritionLabel}>ккал</span>
                                </div>
                                <div className={css.nutritionItem}>
                                    <span className={css.nutritionValue}>{dishFromState.proteins || '0'}</span>
                                    <span className={css.nutritionLabel}>белки</span>
                                </div>
                                <div className={css.nutritionItem}>
                                    <span className={css.nutritionValue}>{dishFromState.fats || '0'}</span>
                                    <span className={css.nutritionLabel}>жиры</span>
                                </div>
                                <div className={css.nutritionItem}>
                                    <span className={css.nutritionValue}>{dishFromState.carbohydrates || '0'}</span>
                                    <span className={css.nutritionLabel}>углеводы</span>
                                </div>
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

