import React from "react";
import css from './StoryComponent.module.css';

interface IStoryComponentProps {
    title: string;
    description: string;
    img: string;
}

export const StoryComponent: React.FC<IStoryComponentProps> = ({ title, description, img }) => {
    return (
        <div className={css.story_component}>
            <h2>{title}</h2>
            <p>{description}</p>
            <img src={img} alt={title} />
        </div>
    );
}
