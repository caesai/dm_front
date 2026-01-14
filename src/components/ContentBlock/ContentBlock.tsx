import React from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IContentBlockProps extends React.HTMLAttributes<HTMLDivElement> {
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
    /**
     * Стили.
     */
    style?: React.CSSProperties;    
}

/**
 * Компонент блока контента.
 * @param {IContentBlockProps} props
 * @component
 * @example
 * <ContentBlock id="content-block">
 *     <div>Content</div>
 * </ContentBlock>
 * @returns {JSX.Element} - Компонент блока контента.
 */
export const ContentBlock: React.FC<IContentBlockProps> = ({ children, id, className, style, ...rest }): JSX.Element => {
    return (
        <div className={classNames(css.contentBlock, className)} id={id} style={style} {...rest}>
            {children}
        </div>
    );
};
