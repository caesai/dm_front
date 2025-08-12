import { FC } from 'react';
import css from './CommentaryOptionButton.module.css';
import { useAtom } from 'jotai';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import classNames from 'classnames';

interface ICommentaryOptionButton {
    text: string;
    icon: string;
    disabled?: boolean;
}

export const CommentaryOptionButton: FC<ICommentaryOptionButton> = ({
    text,
    icon,
    disabled
}) => {
    const [getAtom, setAtom] = useAtom(commAtom);
    const onClick = () => {
        if (!disabled) {
            setAtom(text)
        }
    }
    return (
        <div
            className={classNames(
                css.button,
                getAtom.includes(text) ? css.button__active : null,
                disabled ? css.disabled : null
            )}
            onClick={onClick}
        >
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
};
