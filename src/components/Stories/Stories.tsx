import React from 'react';
import { useEffect, useState } from 'react';
import { ApiGetStoriesBlocks } from '@/api/stories.ts';
import { IStoryBlock } from '@/types/stories.ts';
import { StoryComponent } from '@/components/Stories/StoryComponent/StoryComponent.tsx';
import { StoriesContainer } from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';
import { StoriesBlocksContainer } from '@/components/Stories/StoriesBlocksContainer/StoriesBlocksContainer.tsx';
// import { getBlobFromUrl } from '@/utils.ts';
// import { getBlobFromUrl } from '@/utils.ts';

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
                const blocks = storiesBlockResponse.data.filter((item) => (
                    item.stories.length > 0
                )).map((block) => {
                    const convertedStories = block.stories.map((story) => {
                        let storyContainer = null;
                        if (story.type.toLowerCase() === 'component') {
                             storyContainer = () => <StoryComponent {...story} />;
                        }
                        if (story.type.toLowerCase() === 'video') {
                            // console.log('story url: ', story.url)
                        //     const fileName = "video.mp4"; // Desired file name with .mp4 extension
                        //     const fileType = "video/mp4"; // MIME type for MP4
                        //     // getBlobFromUrl(story.url).then(videoBlob => {
                        //     console.log('story.url: ', story.url);
                        //     const blobUrl = story.url.replace('https://', 'blob://');
                        //     getBlobFromUrl(blobUrl)
                        //     console.log('blobUrl: ', blobUrl);
                        //     const myFile = new File([blobUrl], fileName, { type: fileType });
                        //     const newUrl = URL.createObjectURL(myFile);
                        //     console.log('newUrl: ', newUrl);
                        //     return {
                        //         ...story,
                        //         type: story.type.toLowerCase(),
                        //         url: newUrl,
                        //         duration: story.duration,
                        //         component: storyContainer,
                        //     };
                        }
                        return {
                            ...story,
                            type: story.type.toLowerCase(),
                            component: storyContainer,
                            url: story.url ? story.url : '',
                            title: story.title ? story.title : '',
                            description: story.description ? story.description : '',
                            button_url: story.button_url ? story.button_url : '',
                            button_text: story.button_text ? story.button_text : '',
                            button_color: story.button_color ? story.button_color : '',
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
    }, [cityId]);
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
