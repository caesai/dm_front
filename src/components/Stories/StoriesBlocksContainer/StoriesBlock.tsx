import css from './StoriesBlock.module.css';
import React from "react";
import classNames from 'classnames';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
    isSeen?: boolean;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, index, isSeen }) => {
    const handleClick = () => {
        onClick(index);
    }
    return (
        <div className={classNames(css.storyBlock, !isSeen ? css.isClicked : null)} onClick={handleClick}>
            <div className={css.storyBlockImage}>
                <img src={thumbnail} alt="" />
            </div>
        </div>
    );
};
