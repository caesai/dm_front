import React from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/ContentContainer/ContentContainer.module.css';

interface IContentContainerProps {
    /**
     * Дочерние элементы.
     */
    children: React.ReactNode;
    /**
     * ID блока.
     */
    id?: string;
    /**
     * Классы.
     */
    className?: string;
}

export const ContentContainer: React.FC<IContentContainerProps> = ({ children, id, className }): JSX.Element => {
    /**
     * Возвращаем контейнер контента.
     */
    return (
        <article className={classNames(css.contentContainer, className)} id={id}>
            {children}
        </article>
    );
};
