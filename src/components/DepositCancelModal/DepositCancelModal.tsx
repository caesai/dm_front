import React from 'react';
// Components
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
// Styles
import css from '@/components/DepositCancelModal/DepositCancelModal.module.css';

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
 * return {JSX.Element}
 */
export const DepositCancelModal: React.FC<IDepositCancelModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
}): JSX.Element => {
    return (
        <ModalPopup
            isOpen={isOpen}
            setOpen={onCancel}
            title="Отмена бронирования"
            list={
                <div className={css.content}>
                    <p className={css.description}>
                        Вы отменяете бронь с депозитом.
                    </p>
                    <p className={css.conditionsTitle}>Условия возврата:</p>
                    <ul className={css.conditionsList}>
                        <li>100% возврат депозита при отмене бронирования до 11.02 включительно</li>
                        <li>50% возврат депозита при отмене бронирования до 13.02 включительно</li>
                        <li>Депозит не возвращается при отмене 14.02</li>
                    </ul>
                    <p className={css.question}>Вы уверены, что хотите отменить бронирование?</p>
                </div>
            }
            button={true}
            btnText="Да"
            btnAction={onConfirm}
            btnScndrText="Нет"
            btnScndrAction={onCancel}
            btnsColumn={true}
            reverseButton={true}
        />
    );
};
