import React from 'react';
import { useEffect, useState } from 'react';
import { ApiGetStoriesBlocks } from '@/api/stories.ts';
import { IStoryBlock } from '@/types/stories.ts';
import { StoryComponent } from '@/components/Stories/StoryComponent/StoryComponent.tsx';
import { StoriesContainer } from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';
import { StoriesBlocksContainer } from '@/components/Stories/StoriesBlocksContainer/StoriesBlocksContainer.tsx';

export const Stories: React.FC = () => {
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [storiesBlocks, setStoriesBlocks] = useState<IStoryBlock[]>([]);

    const openStory = (index: number) => {
        setActiveStoryIndex(index);
    };
    const closeStory = () => {
        setActiveStoryIndex(null);
    };
    useEffect(() => {
        // TODO: Endpoint to get array of stories objects sets state of stories
        ApiGetStoriesBlocks().then((storiesBlockResponse) => {
            const blocks = storiesBlockResponse().map((block) => {
                const convertedStories = block.stories.map((story) => {
                    const { description, title, url, type } = story;
                    if (type === 'component') {
                        const storyContainer = () => <StoryComponent img={url} title={title}
                                                                     description={description} />;
                        return {
                            ...story,
                            component: storyContainer,
                        };
                    }
                    return story;
                });
                return {
                    ...block,
                    stories: convertedStories,
                };
            });
            setStoriesBlocks(blocks);
        });
    }, []);
    return (
        <>
            {activeStoryIndex !== null &&
                <StoriesContainer storiesBlocks={storiesBlocks} activeStoryIndex={activeStoryIndex} onClose={closeStory} />}
            <div>
                <StoriesBlocksContainer storiesBlocks={storiesBlocks} openStory={openStory} />
            </div>
        </>
    );
};
