import React from "react";
import classnames from 'classnames';
// Styles
import css from '@/components/SwitchButton/SwitchButton.module.css';

/**
 * Свойства (Props) компонента SwitchButton.
 * @interface
 */
interface SwitchButtonProps {
    checked: boolean;
    toggle: () => void;
    disabled?: boolean;
}
/**
 * Компонент переключателя.
 * @param checked - Флаг, определяющий состояние переключателя.
 * @param toggle - Функция, вызываемая при клике на переключатель.
 * @param disabled - Флаг, блокирующий переключатель (опционально).
 * @returns {JSX.Element}
 */
export const SwitchButton: React.FC<SwitchButtonProps> = ({ checked, toggle, disabled = false }): JSX.Element => {
    return (
        <label className={classnames(css.switchButton, { [css.checked]: checked, [css.disabled]: disabled })}>
            <input type="checkbox" checked={checked} onChange={toggle} disabled={disabled} className={css.switchButton_input} />
            <span className={css.switchButton_track}>
                <span className={classnames(css.switchButton_track_thumb, { [css.checked]: checked })} />
            </span>
        </label>
    );
};