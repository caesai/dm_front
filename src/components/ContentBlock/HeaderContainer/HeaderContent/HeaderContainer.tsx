import { FC } from 'react';
import css from '../../ContentBlock.module.css';

interface IProps {
    title: React.ReactNode;
    id?: string;
}

export const HeaderContent: FC<IProps> = (p) => {
    return (
        <h3 className={css.contentHeader} id={p.id}>
            {p.title}
        </h3>
    );
};
