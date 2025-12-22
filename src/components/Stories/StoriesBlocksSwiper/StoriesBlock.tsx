import React, { useCallback } from 'react';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock';
import css from '@/components/Stories/StoriesBlocksSwiper/StoriesBlock.module.css';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail?: string | undefined;
    name: string | undefined;
    isLoading?: boolean;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, name, index, isLoading = false }) => {
    const handleClick = useCallback(() => {
        onClick(index);
    }, [onClick, index]);

    return (
        <section className={css.storyContainer}>
            <div className={css.storyBorder}>
                <div className={css.storyBlock} onClick={handleClick}>
                    <div className={css.storyBlockImage}>
                        {isLoading ? (
                            <PlaceholderBlock width={'100%'} height={'100%'} />
                        ) : (
                            <img src={thumbnail ?? ''} alt="" />
                        )}
                    </div>
                </div>
            </div>
            <span>{name}</span>
        </section>
    );
};
