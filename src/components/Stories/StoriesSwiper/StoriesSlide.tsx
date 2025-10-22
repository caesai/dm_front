import { IStory } from '@/types/stories.types.ts';
import React from 'react';
import { useAtom } from 'jotai/index';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';
import moment from 'moment/moment';
import classnames from 'classnames';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
import StoriesContainer from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';

interface StorySlideProps {
    onAllStoriesEnd: () => void;
    onClose: () => void;
    storyId: number;
    stories: IStory[];
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

    return (
        <div className={classnames(css.stories_container)}>
            <span className={classnames(css.closeIcon)} onClick={onClose}>
                <CloseIcon size={44} color={'red'} />
            </span>
            <StoriesContainer
                shouldWait={shouldWait}
                stories={stories}
                width={'100%'}
                height={'100%'}
                preloadCount={0}
                onAllStoriesEnd={handleStoryEnd}
                onStoryEnd={onStoryChange}
                currentIndex={localStory !== undefined ? localStory.index : undefined}
                onStoryStart={() => {}}
            />
        </div>
    );
};
