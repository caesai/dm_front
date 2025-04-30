import css from './ContentContainer.module.css';
import { FC } from 'react';

interface IProps {
    children: React.ReactNode;
    id?: string;
}

export const ContentContainer: FC<IProps> = (p) => {
    return (
        <div className={css.contentContainer} id={p.id}>
            {p.children}
        </div>
    );
};
