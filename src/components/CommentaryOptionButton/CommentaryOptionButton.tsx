import { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { useAtom } from 'jotai';
// Atoms
import { commAtom } from '@/atoms/bookingCommAtom.ts';
// Styles
import css from '@/components/CommentaryOptionButton/CommentaryOptionButton.module.css';

/**
 * Свойства (Props) компонента CommentaryOptionButton.
 * @interface
 */
interface ICommentaryOptionButton {
    text: string;
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
    active?: boolean;
    style?: CSSProperties;
    newDesign?: boolean
}

/**
 * Компонент кнопки комментария
 * @param {ICommentaryOptionButton} props
 * @returns {JSX.Element}
 */
export const CommentaryOptionButton: FC<ICommentaryOptionButton> = ({
    text,
    icon,
    disabled,
    onClick,
    active,
    style,
    newDesign
}: ICommentaryOptionButton): JSX.Element => {
    const [getAtom, setAtom] = useAtom(commAtom);
    const handleClick = () => {
        if (!disabled && !onClick) {
            setAtom(text)
        } else {
            onClick && onClick();
        }
    }
    return (
        <div
            className={classNames(
                css.button,
                getAtom.includes(text) ? css.button__active : null,
                active && !newDesign ? css.button__active : null,
                active && newDesign ? css.button__active_new_design : null,
                disabled ? css.disabled : null
            )}
            style={style}
            onClick={handleClick}
        >
            <span>{icon} {text}</span>
        </div>
    );
};
