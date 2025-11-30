import React from 'react';
import css from './DishCard.module.css';
import { IDish } from '@/types/gastronomy.types.ts';
import { PlusIcon } from '@/components/Icons/PlusIcon.tsx';
import { MinusIcon } from '@/components/Icons/MinusIcon.tsx';

interface DishCardProps extends IDish {
    quantity: number;
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
    onClick?: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({
    id,
    title,
    price_msw, // заменить на prices после того, как переделают апи
    weights,
    image_url,
    quantity,
    onAdd,
    onRemove,
    onClick,
}) => {
    // const defaultPrice = prices[0];
    const defaultPrice = price_msw[0] || 1000;
    const defaultWeight = weights[0];

    return (
        <div className={css.menuItem}>
            <div
                className={css.image}
                style={{ backgroundImage: `url(${image_url})` }}
                onClick={onClick}
            />
            <div className={css.content} onClick={onClick}>
                <div className={css.subtitle}>
                    <span className={css.title}>{title}</span>
                    <span className={css.weight}>{defaultWeight}</span>
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

