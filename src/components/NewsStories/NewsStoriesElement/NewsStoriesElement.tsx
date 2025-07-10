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
            {/*<div className={css.newsText}>*/}
            {/*    <span>{index === 0 ? 'Знакомство' : 'Новое место'}</span>*/}
            {/*</div>*/}
            <div className={css.newsImage}>
                <img src={index === 1 ? "./img/BBQNEW.png" : "./img/placeholder_1.png"} alt="" />
            </div>
        </div>
    );
};
