import React from 'react';
import css from './StoryComponent.module.css';
import classNames from 'classnames';
import classnames from 'classnames';
import logoNew from '/img/DT_concierge_logo_1.png';

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
                <div className={classnames(css.logo_container)}>
                    <img
                        className={classnames(css.logo)}
                        src={logoNew}
                        alt="DreamTeam logo"
                    />
                </div>
            </div>
        </div>
    );
};
