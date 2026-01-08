import React from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IContentBlockProps {
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

/**
 * Компонент блока контента.
 * 
 * @component
 * @example
 * <ContentBlock id="content-block">
 *     <div>Content</div>
 * </ContentBlock>
 * @param children - Дочерние элементы.
 * @param id - ID блока.
 * @param className - Классы.
 * @returns {JSX.Element} - Компонент блока контента.
 */
export const ContentBlock: React.FC<IContentBlockProps> = ({ children, id, className }): JSX.Element => {
    return (
        <div className={classNames(css.contentBlock, className)} id={id}>
            {children}
        </div>
    );
};
