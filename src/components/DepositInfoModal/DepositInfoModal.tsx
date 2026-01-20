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
            title="Требуется депозит"
            list={
                <div className={css.content}>
                    <p className={css.description}>
                        В этот день бронирование возможно только с предоплатой депозита.
                    </p>
                    <p className={css.depositAmount}>
                        Сумма депозита: {depositPerPerson} ₽ за 1 человека.
                    </p>
                    <p className={css.conditionsTitle}>Условия возврата:</p>
                    <ul className={css.conditionsList}>
                        <li>Отмена за 3+ дня — 100% возврат</li>
                        <li>Отмена менее чем за 3 дня — 50% возврат</li>
                        <li>В день бронирования — возврат невозможен</li>
                    </ul>
                </div>
            }
            button={true}
            btnText="ОК"
            btnAction={onConfirm}
        />
    );
};
