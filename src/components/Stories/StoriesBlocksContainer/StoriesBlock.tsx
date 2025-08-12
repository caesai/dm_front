import css from './StoriesBlock.module.css';
import React from "react";
import classNames from 'classnames';
import { useAtom } from 'jotai/index';
import { storiesLocalCountAtom } from '@/atoms/storiesLocalAtom.ts';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
    storyId: string;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, index, storyId }) => {
    const [storiesLocalCount] = useAtom(storiesLocalCountAtom);
    const handleClick = () => {
        onClick(index);
    }
    const storyLocal = storiesLocalCount.find((item) => item.id === storyId);
    return (
        <div className={classNames(css.storyBlock, !storyLocal?.isSeen ? css.isClicked : null)} onClick={handleClick}>
            <div className={css.storyBlockImage}>
                <img src={thumbnail} alt="" />
            </div>
        </div>
    );
};
