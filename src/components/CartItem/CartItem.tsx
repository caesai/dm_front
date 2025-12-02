import React from 'react';
import css from './CartItem.module.css';
import { PlusIcon } from '@/components/Icons/PlusIcon.tsx';
import { MinusIcon } from '@/components/Icons/MinusIcon.tsx';

export interface CartItemProps {
    id: number;
    title: string;
    price: number;
    weight: string;
    image: string;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

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

export const CartItem: React.FC<CartItemProps> = ({
    title,
    price,
    weight,
    image,
    quantity,
    onAdd,
    onRemove,
}) => {
    const formattedWeight = formatWeight(weight);
    return (
        <div className={css.item}>
            <div className={css.content}>
                <div
                    className={css.image}
                    style={{ backgroundImage: `url(${image})` }}
                />
                <div className={css.info}>
                    <div className={css.details}>
                        <span className={css.title}>{title}</span>
                        <div className={css.priceRow}>
                            <span className={css.price}>{price} ₽</span>
                            {formattedWeight && (
                                <span className={css.weight}>{formattedWeight}</span>
                            )}
                        </div>
                    </div>
                    <div className={css.controls}>
                        <button className={css.controlButton} onClick={onRemove}>
                            <MinusIcon size={10} color="#000000" />
                        </button>
                        <span className={css.quantity}>{quantity}</span>
                        <button className={css.controlButton} onClick={onAdd}>
                            <PlusIcon size={10} color="#000000" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

