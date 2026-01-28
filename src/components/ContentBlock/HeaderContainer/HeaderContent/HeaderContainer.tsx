import React from 'react';
import classNames from 'classnames';
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IHeaderContentProps {
    title: React.ReactNode;
    id?: string;
    className?: string;
    fontSize?: number;
}

export const HeaderContent: React.FC<IHeaderContentProps> = (
    {
        title,
        id,
        className,
        fontSize = 20
    }): JSX.Element => {
    return (
        <h3
            className={classNames(css.contentHeader, className)}
            id={id}
            style={{fontSize: `${fontSize}px`}}
        >
            {title}
        </h3>
    );
};
