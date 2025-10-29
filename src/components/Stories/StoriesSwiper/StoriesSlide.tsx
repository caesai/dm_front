import { IStory } from '@/types/stories.types.ts';
import React, { useCallback, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';
import moment from 'moment';
import classnames from 'classnames';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
import StoriesContainer from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';

interface LocalStoryMeta {
    id: number;
    index: number;
    isSeen: boolean;
    lastSeenDate: string;
}

interface StorySlideProps {
    onAllStoriesEnd: () => void;
    onClose: () => void;
    storyId: number;
    stories: IStory[];
    shouldWait: boolean;
    isPaused: boolean;
}

export const StorySlide: React.FC<StorySlideProps> = (
    {
        onAllStoriesEnd,
        storyId,
        stories,
        onClose,
        shouldWait,
        isPaused,
    },
) => {
    const [localStories, setLocalStories] = useAtom(localStoriesListAtom);
    const [localStory, setLocalStory] = useState<LocalStoryMeta | undefined>(undefined);

    // Use a useEffect to react to changes in the Jotai atom or storyId.
    useEffect(() => {
        const foundStory = localStories.find(item => item.id === storyId);
        setLocalStory(foundStory);
    }, [localStories, storyId]);

    const updateLocalStories = useCallback((updater: (prevItems: LocalStoryMeta[]) => LocalStoryMeta[]) => {
        setLocalStories(updater);
    }, [setLocalStories]);

    const handleStoryEnd = useCallback(() => {
        updateLocalStories(prevItems => {
            const localIndex = prevItems.findIndex(item => item.id === storyId);
            if (localIndex === -1) {
                return [...prevItems, {
                    id: storyId,
                    index: 0,
                    isSeen: true,
                    lastSeenDate: moment().format('YYYY-MM-DD'),
                }];
            }

            const existingItem = prevItems[localIndex];
            const updatedItem: LocalStoryMeta = {
                ...existingItem,
                index: 0,
                isSeen: true,
                lastSeenDate: moment().format('YYYY-MM-DD'),
            };

            return [
                ...prevItems.slice(0, localIndex),
                updatedItem,
                ...prevItems.slice(localIndex + 1),
            ];
        });
        onAllStoriesEnd();
    }, [storyId, updateLocalStories, onAllStoriesEnd]);

    const handleStoryChange = useCallback((index: number) => {
        updateLocalStories(prevItems => {
            const localIndex = prevItems.findIndex(item => item.id === storyId);

            if (localIndex !== -1) {
                const existingItem = prevItems[localIndex];
                if (index > existingItem.index && index <= stories.length - 1) {
                    const updatedItem = { ...existingItem, index };
                    return [
                        ...prevItems.slice(0, localIndex),
                        updatedItem,
                        ...prevItems.slice(localIndex + 1),
                    ];
                }
                return prevItems;
            } else {
                const newStoryLocalMeta: LocalStoryMeta = {
                    id: storyId,
                    index,
                    isSeen: false,
                    lastSeenDate: moment().format('YYYY-MM-DD'),
                };
                return [...prevItems, newStoryLocalMeta];
            }
        });
    }, [storyId, stories.length, updateLocalStories]);

    let initialStoryIndex = 0;
    if (localStory) {
        if (localStory.isSeen) {
            // Если история уже просмотрена, начинаем с начала
            initialStoryIndex = 0;
        } else {
            // Если история не полностью просмотрена, находим следующий непросмотренный индекс
            const nextUnseenIndex = localStory.index + 1;
            initialStoryIndex = nextUnseenIndex < stories.length ? nextUnseenIndex : 0;
        }
    }
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
                onStoryEnd={handleStoryChange}
                isPaused={isPaused}
                currentIndex={initialStoryIndex}
                onStoryStart={() => {}}
            />
        </div>
    );
};
