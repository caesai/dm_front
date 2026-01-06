import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// Types
import { IMenuItem } from '@/types/restaurant.types.ts';
import { IMenuItem as IAPIMenuItem } from '@/types/menu.types.ts';
// Components
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
// Styles
import css from '@/pages/RestaurantDishDetailsPage/RestaurantDishDetailsPage.module.css';
// Utils
import { extractPrice, getDefaultSize } from '@/utils/menu.utils.ts';
// Hooks
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu';

const formatWeight = (weight: string | undefined, weight_unit?: string): string | undefined => {
    if (!weight) return undefined;
    if (!weight_unit) return weight;
    return `${weight} ${weight_unit}`;
};

const formatAllergens = (allergens: any[] | undefined): string => {
    if (!allergens?.length) return 'Нет';

    const names = allergens
        .map((a) => {
            if (typeof a === 'string' && a.trim()) return a.trim();
            if (a && typeof a === 'object') {
                return (a as any).name || (a as any).title || '';
            }
            return '';
        })
        .filter(Boolean);

    return names.length > 0 ? names.join(', ') : 'Нет';
};

export const RestaurantDishDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const dishFromState = location.state?.dish as IMenuItem & {
        description?: string;
        composition?: string;
        calories?: number | null;
        proteins?: number | null;
        fats?: number | null;
        carbohydrates?: number | null;
        allergens?: string[];
        weights?: string[];
        weight_value?: string;
        volume?: string;
        item_sizes?: IAPIMenuItem['item_sizes'];
        isCocktail?: boolean;
    };

    const { menuData } = useRestaurantMenu(String(id));
    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);

    // Найти первое блюдо с изображением из меню для использования в коктейлях
    const firstDishImage = useMemo(() => {
        if (!menuData) return '';
        
        for (const category of menuData.item_categories) {
            if (category.is_hidden) continue;
            
            for (const item of category.menu_items) {
                if (item.is_hidden) continue;
                
                const defaultSize = getDefaultSize(item.item_sizes);
                const imageUrl = defaultSize?.button_image_url || '';
                
                if (imageUrl && imageUrl.trim().length > 0) {
                    return imageUrl;
                }
            }
        }
        
        return '';
    }, [menuData]);

    // Определить изображение для отображения
    const displayImageUrl = useMemo(() => {
        // Если это коктейль и есть изображение первого блюда, используем его
        if (dishFromState?.isCocktail && firstDishImage) {
            return firstDishImage;
        }
        // Иначе используем обычное изображение блюда
        return dishFromState?.photo_url || '';
    }, [dishFromState, firstDishImage]);

    const currentSize = useMemo(() => {
        return dishFromState?.item_sizes?.[selectedWeightIndex] || dishFromState?.item_sizes?.[0] || null;
    }, [dishFromState, selectedWeightIndex]);

    const currentPrice = useMemo(() => {
        return currentSize ? extractPrice(currentSize.prices) : dishFromState?.price || 0;
    }, [currentSize, dishFromState]);

    const currentWeight = useMemo(() => {
        const unit = dishFromState?.weight_value || '';

        if (currentSize) {
            return `${currentSize.portion_weight_grams} ${unit}`.trim();
        }
        if (dishFromState?.weights?.length) {
            const rawWeight = dishFromState.weights[selectedWeightIndex] || dishFromState.weights[0];
            return formatWeight(rawWeight, unit);
        }
        return undefined;
    }, [currentSize, dishFromState, selectedWeightIndex]);

    if (!dishFromState) {
        return (
            <div className={css.errorContainer}>
                <p>Блюдо не найдено</p>
                <button onClick={() => navigate(`/restaurant/${id}/menu`, { state: { fromDishDetails: true } })}>Назад</button>
            </div>
        );
    }

    const hasMultipleWeights = dishFromState?.item_sizes && dishFromState.item_sizes.length > 1;

    const handleBookTable = () => {
        navigate(`/restaurant/${id}/booking`);
    };

    const handleGoBack = () => {
        // Передаем информацию о том, что возвращаемся со страницы деталей
        navigate(`/restaurant/${id}/menu`, {
            state: { fromDishDetails: true },
        });
    };

    return (
        <div className={css.page}>
            <div className={css.mainCard}>
                <div className={css.header}>
                    <button className={css.backButton} onClick={handleGoBack}>
                        <BackIcon />
                    </button>
                    <h1 className={css.headerTitle}>{dishFromState.title}</h1>
                    <div className={css.spacer} />
                </div>

                <div className={css.content}>
                    <div
                        className={css.mainImage}
                        style={{
                            backgroundImage: displayImageUrl ? `url(${displayImageUrl})` : 'none',
                            backgroundColor: displayImageUrl ? 'transparent' : '#F4F4F4',
                        }}
                    />

                    <div className={css.titleSection}>
                        <div className={css.titleRow}>
                            <h2 className={css.dishTitle}>{dishFromState.title}</h2>
                            <span className={css.dishPrice}>{currentPrice} ₽</span>
                        </div>
                        {currentWeight && <span className={css.selectedWeight}>{currentWeight}</span>}
                    </div>

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

                    {/* Описание - выводим только если есть */}
                    {dishFromState.description && dishFromState.description.trim() && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Описание</span>
                            <p className={css.sectionText}>{dishFromState.description}</p>
                        </div>
                    )}

                    {/* Состав - выводим только если есть, это отдельное поле */}
                    {dishFromState.composition && dishFromState.composition.trim() && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>Состав</span>
                            <p className={css.sectionText}>{dishFromState.composition}</p>
                        </div>
                    )}

                    {(dishFromState.calories !== null ||
                        dishFromState.proteins !== null ||
                        dishFromState.fats !== null ||
                        dishFromState.carbohydrates !== null) && (
                        <div className={css.section}>
                            <span className={css.sectionTitle}>На 100 граммов</span>
                            <div className={css.nutritionGrid}>
                                {dishFromState.calories !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{dishFromState.calories}</span>
                                        <span className={css.nutritionLabel}>ккал</span>
                                    </div>
                                )}
                                {dishFromState.proteins !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{dishFromState.proteins}</span>
                                        <span className={css.nutritionLabel}>белки</span>
                                    </div>
                                )}
                                {dishFromState.fats !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{dishFromState.fats}</span>
                                        <span className={css.nutritionLabel}>жиры</span>
                                    </div>
                                )}
                                {dishFromState.carbohydrates !== null && (
                                    <div className={css.nutritionItem}>
                                        <span className={css.nutritionValue}>{dishFromState.carbohydrates}</span>
                                        <span className={css.nutritionLabel}>углеводы</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={css.section}>
                        <span className={css.sectionTitle}>Аллергены</span>
                        <p className={css.sectionText}>{formatAllergens(dishFromState.allergens)}</p>
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
