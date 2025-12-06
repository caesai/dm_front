import React from 'react';
import css from './CartItem.module.css';
import { PlusIcon } from '@/components/Icons/PlusIcon.tsx';
import { MinusIcon } from '@/components/Icons/MinusIcon.tsx';
import { formatWeight } from '@/pages/GastronomyPage/stages/GastronomyDishDetailsPage/GastonomyDishDetailsPage';

export interface CartItemProps {
    id: number;
    title: string;
    price: number;
    weight: string;
    weight_value: string | undefined;
    image: string;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
    title,
    price,
    weight,
    image,
    quantity,
    onAdd,
    onRemove,
    weight_value,
}) => {
    const formattedWeight = formatWeight(weight, weight_value);
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

