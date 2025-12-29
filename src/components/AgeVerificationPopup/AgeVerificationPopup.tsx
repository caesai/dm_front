import React, { useEffect } from 'react';
import classNames from 'classnames';
import css from './AgeVerificationPopup.module.css';

interface AgeVerificationPopupProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AgeVerificationPopup: React.FC<AgeVerificationPopupProps> = ({ isOpen, onConfirm, onCancel }) => {
    // Блокируем скролл фона при открытом попапе
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={css.modal} onClick={(e) => {
            // Закрываем при клике на фон только если клик был именно на фон
            if (e.target === e.currentTarget) {
                onCancel();
            }
        }}>
            <div className={css.content} onClick={(e) => e.stopPropagation()}>
                <p className={css.text}>
                    В данном разделе меню представлена продукция, содержащая алкоголь. Информация
                    предназначена для лиц, достигших совершеннолетия.
                </p>
                <div className={css.buttons}>
                    <button className={classNames(css.button, css.primaryButton)} onClick={onConfirm}>
                        Да, мне есть 18 лет
                    </button>
                    <button className={classNames(css.button, css.secondaryButton)} onClick={onCancel}>
                        Нет, мне нет 18 лет
                    </button>
                </div>
            </div>
        </div>
    );
};
