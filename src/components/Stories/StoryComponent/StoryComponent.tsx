import React from 'react';
import css from './StoryComponent.module.css';
import classNames from 'classnames';
import { IStory } from '@/types/stories.ts';
// import classnames from 'classnames';

interface StoryComponentProps extends IStory {

}

export const StoryComponent: React.FC<StoryComponentProps> = ({ title, description, url, button_url, button_text, button_color }) => {
    const openButtonUrl = () => {
        button_url && window.open(button_url);
    }
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
                                className={css.button}
                                style={{
                                    backgroundColor: button_color?.toString(),
                                }}
                                onClick={openButtonUrl}
                            >
                                <span>{button_text}</span>
                            </div>
                        </div>
                    )}
                </div>
                {url && (
                    <div className={css.storyImageWrapper}>
                        <img src={url} alt={description?.toString()} />
                    </div>
                )}
            </div>
        </div>
    );
};
