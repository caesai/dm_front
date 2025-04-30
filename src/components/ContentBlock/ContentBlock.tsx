import css from './ContentBlock.module.css';
import { FC } from 'react';

interface IProps {
    children: React.ReactNode;
    id?: string;
}

export const ContentBlock: FC<IProps> = (p) => {
    return (
        <div className={css.contentBlock} id={p.id}>
            {p.children}
        </div>
    );
};
