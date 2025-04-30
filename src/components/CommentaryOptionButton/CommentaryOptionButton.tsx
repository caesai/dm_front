import { FC } from 'react';
import css from './CommentaryOptionButton.module.css';
import { useAtom } from 'jotai';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import classNames from 'classnames';

interface ICommentaryOptionButton {
    text: string;
    icon: string;
}

export const CommentaryOptionButton: FC<ICommentaryOptionButton> = ({
    text,
    icon,
}) => {
    const [getAtom, setAtom] = useAtom(commAtom);

    return (
        <div
            className={classNames(
                css.button,
                getAtom.includes(text) ? css.button__active : null
            )}
            onClick={() => setAtom(text)}
        >
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
};
