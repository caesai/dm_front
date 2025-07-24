import css from './NewsStoriesElement.module.css';
import React, {useState} from "react";
import classNames from 'classnames';

interface NewsStoriesElementInterface {
    onClick: (index: number) => void;
    index: number;
    thumbnail: string;
}

export const NewsStoriesElement: React.FC<NewsStoriesElementInterface> = ({ onClick, thumbnail, index }) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onClick(index);
        setIsClicked(true);
    }
    return (
        <div className={classNames(css.element, !isClicked ? css.isClicked : null)} onClick={handleClick}>
            <div className={css.newsImage}>
                <img src={thumbnail} alt="" />
            </div>
        </div>
    );
};
