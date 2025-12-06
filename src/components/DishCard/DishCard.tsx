import React from 'react';
import css from './DishCard.module.css';
import { IDish } from '@/types/gastronomy.types.ts';
import { PlusIcon } from '@/components/Icons/PlusIcon.tsx';
import { MinusIcon } from '@/components/Icons/MinusIcon.tsx';
import { formatWeight } from '@/pages/GastronomyPage/stages/GastronomyDishDetailsPage/GastonomyDishDetailsPage';

interface DishCardProps extends IDish {
    quantity: number;
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
    onClick?: () => void;
}

export const DishCard: React.FC<DishCardProps> = (
    {
        id,
        guest_title,
        prices,
        weights,
        image_url,
        quantity,
        onAdd,
        onRemove,
        onClick,
        weight_value,
    },
) => {
    const defaultPrice = prices[0];
    const defaultWeight = formatWeight(weights[0], weight_value);

    return (
        <div className={css.menuItem}>
            <div
                className={css.image}
                style={{ backgroundImage: `url(${image_url})` }}
                onClick={onClick}
            />
            <div className={css.content} onClick={onClick}>
                <div className={css.subtitle}>
                    <span className={css.title}>{guest_title}</span>
                    {defaultWeight && (
                        <span className={css.weight}>{defaultWeight}</span>
                    )}
                </div>
            </div>
            <div
                className={quantity > 0 ? css.buttonActive : css.button}
                onClick={() => quantity === 0 && onAdd(id)}
            >
                <div className={css.iconSummary}>
                    {quantity > 0 ? (
                        <>
                            <button
                                className={css.iconButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(id);
                                }}
                            >
                                <MinusIcon size={14} color="#000000" />
                            </button>
                            <span className={css.priceText}>
                                {quantity}
                            </span>
                            <button
                                className={css.iconButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAdd(id);
                                }}
                            >
                                <PlusIcon size={14} color="#000000" />
                            </button>
                        </>
                    ) : (
                        <>
                            <span className={css.priceText}>
                                {defaultPrice} ₽
                            </span>
                            <div className={css.plusIconRight}>
                                <PlusIcon size={14} color="#000000" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

