import React from "react";
// import classnames from "classnames";
import css from "./StoriesContainer.module.css";
import Stories from 'stories-react';
import {IStoryObject} from "stories-react/src/types";
import 'stories-react/dist/index.css';
import {CloseIcon} from "@/components/Icons/CloseIcon.tsx";
//TODO: Remove hardcoded logo
import logoNew from "/img/DT_concierge_logo_1.png";

interface IStoriesContainerProps {
    stories: IStoryObject[];
    onClose?: () => void;
}

const StoriesContainer: React.FC<IStoriesContainerProps> = ({stories, onClose}) => {
    return (
        <div className={css.stories_container}>
            <span className={css.closeIcon} onClick={onClose}>
                <CloseIcon size={44}/>
            </span>
            <div className={css.logo_container}>
                <img
                    className={css.logo}
                    src={logoNew}
                    alt="DreamTeam logo"
                />
            </div>
            <Stories
                width="100%"
                height="100%"
                stories={stories}
                onAllStoriesEnd={onClose}
                classNames={{progressBar: css.progressBar, main: css.slide}}
            />
        </div>
    );
}

export default StoriesContainer;
