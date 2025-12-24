import React from 'react';
import Popup from 'reactjs-popup';
import classNames from 'classnames';
import css from './AgeVerificationPopup.module.css';

interface AgeVerificationPopupProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AgeVerificationPopup: React.FC<AgeVerificationPopupProps> = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <Popup open={isOpen} closeOnDocumentClick={false} modal nested>
            <>
                {() => (
                    <div className={css.modal}>
                        <div className={css.content}>
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
                )}
            </>
        </Popup>
    );
};
