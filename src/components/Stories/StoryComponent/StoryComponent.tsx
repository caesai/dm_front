import React from 'react';
import css from './StoryComponent.module.css';
import classNames from 'classnames';

interface StoryComponentProps {
    title: string;
    description: string;
    img: string;
}

export const StoryComponent: React.FC<StoryComponentProps> = ({ title, description, img }) => {
    return (
        <div className={classNames(css.storyComponent)}>
            <div className={css.storyWrapper}>
                <div className={css.storyFooter}>
                    <div className={css.storyDescription}>
                        <h2 className={classNames(css.storyDescriptionTitle)}>
                            {title}
                        </h2>
                        <span className={classNames(css.storyDescriptionSubtitle)}>
                            {description}
                        </span>
                    </div>
                </div>
                <div className={css.storyImageWrapper}>
                    <img src={img} alt={description} />
                </div>
            </div>
        </div>
    );
};
