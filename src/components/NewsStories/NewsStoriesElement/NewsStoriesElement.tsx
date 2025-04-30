import css from './NewsStoriesElement.module.css';

export const NewsStoriesElement = () => {
    return (
        <div className={css.element}>
            <div className={css.newsText}>
                <span>Новое меню</span>
            </div>
            <div className={css.newsImage}>
                <img src="./img/placeholder_1.png" alt="" />
            </div>
        </div>
    );
};
