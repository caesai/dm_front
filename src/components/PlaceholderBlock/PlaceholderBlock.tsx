import React from 'react';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
// Styles
import css from '@/components/PlaceholderBlock/PlaceholderBlock.module.css';

/**
 * Свойства (Props) компонента PlaceholderBlock.
 * @interface
 */
interface IPlaceholderBlock {
    /** Ширина блока */
    width: string;
    /** Высота блока */
    height?: string;
    /** Радиус скругления */
    rounded?: string;
    /** Минимальная ширина */
    minWidth?: string;
    /** Соотношение сторон */
    aspectRatio?: string;
}

/**
 * Компонент PlaceholderBlock.
 * @param {IPlaceholderBlock} props
 * @returns {JSX.Element}
 */
export const PlaceholderBlock: React.FC<IPlaceholderBlock> = ({
    width,
    height,
    rounded,
    minWidth,
    aspectRatio,
}: IPlaceholderBlock): JSX.Element => {
    return (
        <ContentBlock
            className={css.loadWrapper}
            data-testid="placeholder-block"
            style={{
                width,
                height,
                borderRadius: rounded,
                minWidth,
                aspectRatio,
            }}
        >
            <div className={css.activity} />
        </ContentBlock>
    );
};
