import React from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/ContentBlock/ContentBlock.module.css';

/**
 * Свойства (Props) компонента HeaderContainer.
 * @interface
 */
export interface IHeaderContainerProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

/**
 * Компонент контейнера заголовка
 * @param {IHeaderContainerProps} props
 * @returns {JSX.Element}
 */
export const HeaderContainer: React.FC<IHeaderContainerProps> = ({ children, id, className }: IHeaderContainerProps): JSX.Element => {
    return (
        <header className={classNames(css.headerContainer, className)} id={id}>
            {children}
        </header>
    );
};
