import React from 'react';
import { useState } from 'react';
import { IStoryBlock } from '@/types/stories.types.ts';
import { StoriesSwiper } from '@/components/Stories/StoriesSwiper/StoriesSwiper.tsx';
import { StoriesBlocksSwiper } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlocksSwiper.tsx';

interface IStoriesProps {
    storiesBlocks: IStoryBlock[];
}

export const Stories: React.FC<IStoriesProps> = ({ storiesBlocks }) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

    const openStory = (index: number) => {
        setActiveStoryIndex(index);
    };

    const closeStory = () => {
        setActiveStoryIndex(null);
    };

    return (
        <>
            {activeStoryIndex !== null && (
                <StoriesSwiper storiesBlocks={storiesBlocks} activeStoryIndex={activeStoryIndex} onClose={closeStory} />
            )}
            <div>
                <StoriesBlocksSwiper storiesBlocks={storiesBlocks} openStory={openStory} />
            </div>
        </>
    );
};
