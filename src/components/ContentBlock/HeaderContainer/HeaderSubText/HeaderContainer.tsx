import React from 'react';
import classNames from 'classnames';
import css from '@/components/ContentBlock/ContentBlock.module.css';

/**
 * Свойства (Props) компонента HeaderSubText.
 * @interface
 */
export interface IHeaderSubTextProps {
    text: React.ReactNode;
    id?: string;
    className?: string;
}
/**
 * Компонент подтекста заголовка
 * @param {IHeaderSubTextProps} props
 * @returns {JSX.Element}
 */
export const HeaderSubText: React.FC<IHeaderSubTextProps> = ({ text, id, className }: IHeaderSubTextProps): JSX.Element => {
    return <span className={classNames(css.headerSubText, className)} id={id}>{text}</span>;
};
