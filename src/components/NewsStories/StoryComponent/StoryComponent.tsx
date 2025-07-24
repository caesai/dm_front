import React from "react";
import css from './StoryComponent.module.css';
import classNames from "classnames";

interface IStoryComponentProps {
    title: string;
    description: string;
    img: string;
}

export const StoryComponent: React.FC<IStoryComponentProps> = ({ title, description, img }) => {
    return (
    <div className={classNames(css.story_component)}>
        <div className={css.story_wrapper}>
            <div className={css.story_footer}>

                <div className={css.story_description}>
                    <h2
                        className={classNames(
                            css.story_description_title,
                        )}
                    >
                        {title}
                    </h2>
                    <span
                        className={classNames(
                            css.story_description_subtitle,
                        )}
                    >
                            {description}
                        </span>
                </div>
            </div>
            <div className={css.stageTwo_wrapper} style={{ borderRadius: 12 }}>
                <img src={img} alt={''} style={{maxWidth: '100%', borderRadius: 12}} />
            </div>
        </div>
    </div>
    );
}
