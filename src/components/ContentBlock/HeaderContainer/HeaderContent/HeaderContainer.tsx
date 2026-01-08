import React from 'react';
import classNames from 'classnames';
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IHeaderContentProps {
    title: React.ReactNode;
    id?: string;
    className?: string;
}

export const HeaderContent: React.FC<IHeaderContentProps> = ({ title, id, className }): JSX.Element => {
    return (
        <h3 className={classNames(css.contentHeader, className)} id={id}>
            {title}
        </h3>
    );
};
