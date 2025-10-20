import React from "react";
import StoryHeader from '@/components/Stories/StoryHeader/StoryHeader.tsx';
import { IStoryObject } from '@/types/stories.types.ts';

const withHeader: React.FC<React.PropsWithChildren<{
    story: IStoryObject;
    globalHeader: Function | undefined;
}>> = ({ story, globalHeader, children }) => {
    return (
        <>
            {children}
            {story.header && (
                <div style={{ position: "absolute", left: 12, top: 20, zIndex: 19 }}>
                    {typeof story === "object" ? (
                        globalHeader ? (
                            globalHeader(story.header)
                        ) : (
                            <StoryHeader
                                heading={story.header.heading}
                                subheading={story.header.subheading}
                                profileImage={story.header.profileImage}
                            />
                        )
                    ) : null}
                </div>
            )}
        </>
    );
};

export default withHeader;
