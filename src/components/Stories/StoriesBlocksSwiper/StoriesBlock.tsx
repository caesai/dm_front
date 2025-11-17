import css from './StoriesBlock.module.css';
import React from 'react';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
    name: string;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, name, index }) => {
    const handleClick = () => {
        onClick(index);
    };
    return (
        <section className={css.storyContainer}>
            <div className={css.storyBorder}>
                <div className={css.storyBlock} onClick={handleClick}>
                    <div className={css.storyBlockImage}>
                        <img src={thumbnail} alt="" />
                    </div>
                </div>
            </div>
            <span>{name}</span>
        </section>
    );
};
