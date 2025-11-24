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

export const CartItem: React.FC<CartItemProps> = ({
    title,
    price,
    weight,
    image,
    quantity,
    onAdd,
    onRemove,
}) => {
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
                        <span className={css.price}>{price} ₽</span>
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

