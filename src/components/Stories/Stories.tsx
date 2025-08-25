import React from 'react';
import { useEffect, useState } from 'react';
import { ApiGetStoriesBlocks } from '@/api/stories.ts';
import { IStoryBlock } from '@/types/stories.ts';
import { StoryComponent } from '@/components/Stories/StoryComponent/StoryComponent.tsx';
import { StoriesContainer } from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';
import { StoriesBlocksContainer } from '@/components/Stories/StoriesBlocksContainer/StoriesBlocksContainer.tsx';

interface IStoriesProps {
    cityId?: number;
    token?: string;
}
export const Stories: React.FC<IStoriesProps> = ({ token, cityId }) => {
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
        if (token !== undefined && cityId !== undefined) {
            ApiGetStoriesBlocks(token, cityId).then((storiesBlockResponse) => {
                const blocks = storiesBlockResponse.data.map((block) => {
                    const convertedStories = block.stories.map((story) => {
                        let storyContainer = null;
                        let newUrl = null;
                        if (story.type.toLowerCase() === 'component') {
                             storyContainer = () => <StoryComponent {...story} />;
                        }
                        if (story.type.toLowerCase() === 'video') {
                            const fileName = "video.mp4"; // Desired file name with .mp4 extension
                            const fileType = "video/mp4"; // MIME type for MP4

                            const myFile = new File([story.url], fileName, { type: fileType });
                            newUrl = URL.createObjectURL(myFile);
                        }
                        return {
                            ...story,
                            type: story.type.toLowerCase(),
                            url: newUrl ? newUrl : story.url,
                            duration: story.duration * 1000,
                            component: storyContainer,
                        };
                    });
                    return {
                        ...block,
                        stories: convertedStories,
                    };
                });
                setStoriesBlocks(blocks);
            });
        }
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
