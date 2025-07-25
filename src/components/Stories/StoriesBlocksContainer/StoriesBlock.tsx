import css from './StoriesBlock.module.css';
import React, {useState} from "react";
import classNames from 'classnames';

interface StoriesBlockProps {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
}

export const StoriesBlock: React.FC<StoriesBlockProps> = ({ onClick, thumbnail, index }) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onClick(index);
        setIsClicked(true);
    }
    return (
        <div className={classNames(css.storyBlock, !isClicked ? css.isClicked : null)} onClick={handleClick}>
            <div className={css.storyBlockImage}>
                <img src={thumbnail} alt="" />
            </div>
        </div>
    );
};
