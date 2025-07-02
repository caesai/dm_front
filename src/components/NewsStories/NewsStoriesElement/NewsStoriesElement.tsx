import css from './NewsStoriesElement.module.css';
import React, {useState} from "react";
import classNames from 'classnames';

interface NewsStoriesElementInterface {
    onClick: (index: number) => void;
    index: number;
}

export const NewsStoriesElement: React.FC<NewsStoriesElementInterface> = ({ onClick, index }) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onClick(index);
        setIsClicked(true);
    }
    return (
        <div className={classNames(css.element, !isClicked ? css.isClicked : null)} onClick={handleClick}>
            <div className={css.newsText}>
                <span>Новое меню</span>
            </div>
            <div className={css.newsImage}>
                <img src="./img/placeholder_1.png" alt="" />
            </div>
        </div>
    );
};
