import React from 'react';
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IHeaderContainerProps {
    children: React.ReactNode;
    id?: string;
}

export const HeaderContainer: React.FC<IHeaderContainerProps> = ({ children, id }): JSX.Element => {
    return (
        <div className={css.headerContainer} id={id}>
            {children}
        </div>
    );
};
