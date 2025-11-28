import React from 'react';
import css from './FloatingCartButton.module.css';
import basketIcon from '/img/basket-icon.svg';

interface FloatingCartButtonProps {
    totalAmount: number;
    onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
    totalAmount,
    onClick,
}) => {
    return (
        <div className={css.floatingButton} onClick={onClick}>
            <img src={basketIcon} alt="Корзина" width={28} height={28} />
            <span className={css.priceText}>{totalAmount} ₽</span>
        </div>
    );
};

