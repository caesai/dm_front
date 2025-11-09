import css from './StoriesBlock.module.css';
import React from 'react';
import classNames from 'classnames';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
    name: string;
    isSeen?: boolean;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, name, index, isSeen }) => {
    const handleClick = () => {
        onClick(index);
    };
    return (
        <section className={css.storyContainer}>
            <div className={classNames(css.storyBorder, isSeen ? css.clicked : null)}>
                <div className={classNames(css.storyBlock, !isSeen ? css.active : null)} onClick={handleClick}>
                    <div className={css.storyBlockImage}>
                        <img src={thumbnail} alt="" />
                    </div>
                </div>
            </div>
            <span>{name}</span>
        </section>
    );
};
