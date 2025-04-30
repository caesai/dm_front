import { FC } from 'react';
import css from '../ContentBlock.module.css';

interface IProps {
    children: React.ReactNode;
    id?: string;
}

export const HeaderContainer: FC<IProps> = (p) => {
    return (
        <div className={css.headerContainer} id={p.id}>
            {p.children}
        </div>
    );
};
