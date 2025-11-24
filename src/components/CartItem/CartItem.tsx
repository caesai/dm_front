import React from 'react';
import css from './CartItem.module.css';

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
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1 5H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <span className={css.quantity}>{quantity}</span>
                        <button className={css.controlButton} onClick={onAdd}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M5 1V9M1 5H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

