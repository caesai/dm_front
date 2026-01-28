import React from 'react';
import { ModalPopup } from '../ModalPopup/ModalPopup';
import css from './DepositInfoModal.module.css';

/**
 * Пропсы компонента DepositInfoModal
 */
interface IDepositInfoModalProps {
    /** Флаг открытия модального окна */
    isOpen: boolean;
    /** Сумма депозита на человека */
    depositPerPerson: number;
    /** Callback при подтверждении (нажатие "ОК") */
    onConfirm: () => void;
    /** Callback при отмене (закрытие любым другим способом) */
    onCancel: () => void;
}

/**
 * Модальное окно с информацией о депозите.
 * При закрытии любым способом кроме кнопки "ОК" вызывается onCancel.
 */
export const DepositInfoModal: React.FC<IDepositInfoModalProps> = ({
    isOpen,
    depositPerPerson,
    onConfirm,
    onCancel,
}) => {
    return (
        <ModalPopup
            isOpen={isOpen}
            setOpen={onCancel}
            list={
                <div className={css.content}>
                    <p className={css.description}>
                        В этот день бронирование возможно при условии оплаты депозита
                        в размере <span className={css.depositAmount}>{depositPerPerson}</span> ₽ за 1 гостя.
                    </p>
                    <p className={css.conditionsTitle}>Условия отмены бронирования:</p>
                    <ul className={css.conditionsList}>
                        <li>100% возврат депозита при отмене бронирования до 11.02 включительно</li>
                        <li>50% возврат депозита при отмене бронирования до 13.02 включительно</li>
                        <li>Депозит не возвращается при отмене 14.02</li>
                    </ul>
                </div>
            }
            button={true}
            btnText="ОК"
            btnAction={onConfirm}
        />
    );
};
