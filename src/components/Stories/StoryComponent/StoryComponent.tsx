import React from 'react';
import css from './StoryComponent.module.css';
import classNames from 'classnames';
import { IStory } from '@/types/stories.ts';
import { useNavigate } from 'react-router-dom';
// import classnames from 'classnames';

interface StoryComponentProps extends IStory {

}

export const StoryComponent: React.FC<StoryComponentProps> = ({ title, description, url, button_url, button_text }) => {
    const navigate = useNavigate();
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
                    {button_url && (
                        <div className={css.button_container}>
                            <div
                                className={css.redButton}
                                onClick={() => navigate(button_url)}
                            >
                                <span>{button_text}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className={css.storyImageWrapper}>
                    <img src={url} alt={description} />
                </div>
            </div>
        </div>
    );
};
