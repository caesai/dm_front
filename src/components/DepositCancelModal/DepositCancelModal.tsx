import React from 'react';
import { ModalPopup } from '../ModalPopup/ModalPopup';
import css from './DepositCancelModal.module.css';

/**
 * Пропсы компонента DepositCancelModal
 */
interface IDepositCancelModalProps {
    /** Флаг открытия модального окна */
    isOpen: boolean;
    /** Callback при подтверждении отмены */
    onConfirm: () => void;
    /** Callback при отказе от отмены */
    onCancel: () => void;
}

/**
 * Модальное окно подтверждения отмены бронирования с депозитом.
 * Показывает условия возврата депозита.
 */
export const DepositCancelModal: React.FC<IDepositCancelModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <ModalPopup
            isOpen={isOpen}
            setOpen={onCancel}
            title="Отмена бронирования"
            list={
                <div className={css.content}>
                    <p className={css.description}>Вы отменяете бронь с депозитом.</p>
                    <p className={css.conditionsTitle}>Условия возврата:</p>
                    <ul className={css.conditionsList}>
                        <li>За 3+ дня — 100%</li>
                        <li>Менее чем за 3 дня — 50%</li>
                        <li>В день брони — без возврата</li>
                    </ul>
                    <p className={css.question}>Продолжить?</p>
                </div>
            }
            button={true}
            btnText="Всё равно отменить"
            btnAction={onConfirm}
            btnScndrText="Нет, оставить"
            btnScndrAction={onCancel}
            btnsColumn={true}
            reverseButton={true}
        />
    );
};
