import { CSSProperties, FC } from 'react';
import css from './CommentaryOptionButton.module.css';
import { useAtom } from 'jotai';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import classNames from 'classnames';

interface ICommentaryOptionButton {
    text: string;
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
    active?: boolean;
    style?: CSSProperties;
    newDesign?: boolean
}

export const CommentaryOptionButton: FC<ICommentaryOptionButton> = ({
    text,
    icon,
    disabled,
    onClick,
    active,
    style,
    newDesign
}) => {
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
