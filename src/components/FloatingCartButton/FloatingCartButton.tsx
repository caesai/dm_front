import React from 'react';
import css from './FloatingCartButton.module.css';
import { BasketIcon } from '@/components/Icons/BasketIcon.tsx';

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
            <BasketIcon size={28} color="#FFFFFF" />
            <span className={css.priceText}>{totalAmount} ₽</span>
        </div>
    );
};

