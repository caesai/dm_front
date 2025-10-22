import { IStoryObject, Renderer, Tester } from '@/types/stories.types.ts';
import React from 'react';
import { useAtom } from 'jotai/index';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';
import moment from 'moment/moment';
import classnames from 'classnames';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import StoriesContext from '@/components/Stories/context/StoriesContext.ts';
import { renderers as defaultRenderers } from '@/components/Stories/renderers';
import StoriesContainer from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';

interface StorySlideProps {
    onAllStoriesEnd: () => void;
    onClose: () => void;
    storyId: number;
    stories: IStoryObject[];
    shouldWait: boolean;
}

export const StorySlide: React.FC<StorySlideProps> = (
    {
        onAllStoriesEnd,
        storyId,
        stories,
        onClose,
        shouldWait,
    },
) => {
    const [localStories, setLocalStories] = useAtom(localStoriesListAtom);
    const localStory = localStories.find((item) => item.id === storyId);

    const handleStoryEnd = () => {
        setLocalStories((prevItems) => {
            const localIndex = prevItems.findIndex(item => item.id === storyId);
            if (localIndex === -1) return prevItems; // Item not found

            const isStorySeen = localStory?.isSeen;
            const updatedItem = {
                ...prevItems[localIndex],
                index: 0,
                isSeen: !isStorySeen,
                lastSeenDate: isStorySeen ? prevItems[localIndex].lastSeenDate : moment().format('YYYY-MM-DD'),
            };

            return [
                ...prevItems.slice(0, localIndex),
                updatedItem,
                ...prevItems.slice(localIndex + 1),
            ];
        });

        onAllStoriesEnd();
    };


    const onStoryChange = (index: number) => {
        if (localStory) {
            updateExistingStory(index);
        } else {
            addNewStory(index);
        }
    };

    const updateExistingStory = (index: number) => {
        if (localStory && localStory.index <= stories.length - 1) {
            setLocalStories((prevItems) => {
                const localIndex = prevItems.findIndex(item => item.id === storyId);
                if (localIndex === -1) return prevItems; // Item not found

                const updatedItem = {
                    ...prevItems[localIndex],
                    index,
                };

                return [
                    ...prevItems.slice(0, localIndex),
                    updatedItem,
                    ...prevItems.slice(localIndex + 1),
                ];
            });
        }
    };

    const addNewStory = (index: number) => {
        const newStoryLocalCount = {
            id: storyId,
            index,
            isSeen: false,
            lastSeenDate: moment().format('YYYY-MM-DD'),
        };
        setLocalStories((prevItems) => [...prevItems, newStoryLocalCount]);
    };

    const context = {
        width: '100%',
        height: '100%',
        preloadCount: 0,
        // shouldWait,
        onStoryEnd: onStoryChange,
        onAllStoriesEnd: handleStoryEnd,
        currentIndex: localStory !== undefined ? localStory.index : undefined,
        // css.progressBar, main: css.slide
    };

    return (
        <div className={classnames(css.stories_container)}>
            <span className={classnames(css.closeIcon)} onClick={onClose}>
                <CloseIcon size={44} color={'red'} />
            </span>
            <GlobalStoriesContext.Provider value={context}>
                <StoriesContext.Provider value={generateStories(stories, defaultRenderers)}>
                    <StoriesContainer shouldWait={shouldWait} />
                </StoriesContext.Provider>
            </GlobalStoriesContext.Provider>
        </div>
    );
};

const generateStories = (stories: IStoryObject[], renderers: { renderer: Renderer, tester: Tester }[]) => {
    return stories.map(s => {
        let story: IStoryObject = {
            ...s,
            content: () => <></>,
            originalContent: () => <></>,
            seeMoreCollapsed: () => <></>,
        };

        let renderer = getRenderer(Object.assign(story, s), renderers);
        story.originalContent = story.content;
        story.content = renderer;
        return story;
    });
};

const getRenderer = (story: IStoryObject, renderers: { renderer: Renderer, tester: Tester }[]): Renderer => {
    let probable = renderers.map(r => {
        return {
            ...r,
            testerResult: r.tester(story),
        };
    }).filter(r => r.testerResult.condition);
    probable.sort((a, b) => b.testerResult.priority - a.testerResult.priority);
    return probable[0].renderer;
};
