import { FC } from 'react';
import css from '../../ContentBlock.module.css';

interface IProps {
    text: React.ReactNode;
    id?: string;
}

export const HeaderSubText: FC<IProps> = (p) => {
    return <span className={css.headerSubText}>{p.text}</span>;
};
