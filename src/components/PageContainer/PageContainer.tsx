import React from 'react';
import classNames from 'classnames';
// CSS
import css from '@/components/PageContainer/PageContainer.module.css';

interface IPageContainer {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

export const PageContainer: React.FC<IPageContainer> = ({ children, id, className }) => {
    return (
        <div className={classNames(css.pageContainer, className)} id={id}>
            {children}
        </div>
    );
};
