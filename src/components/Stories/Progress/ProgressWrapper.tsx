import React, { useContext } from 'react'
import { GlobalStoriesCtx } from '@/types/stories.types.ts';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import css from '@/components/Stories/Progress/Progress.module.css';

interface ProgressWrapperProps {
    children: any;
    width: number;
    pause: boolean;
    bufferAction: boolean;
}

const ProgressWrapper: React.FC<ProgressWrapperProps> = (props) => {
    const { progressWrapperStyles } = useContext<GlobalStoriesCtx>(GlobalStoriesContext);

    return (
        <div
            className={css.progress}
            style={{
                ...progressWrapperStyles,
                ...getProgressWrapperStyle(props)
            }}
        >
            {props.children}
        </div>
    )
}

const getProgressWrapperStyle = ({ width }: { width: number }) => ({
    width: `${width * 100}%`,
})

export default ProgressWrapper
