import React, { useContext } from 'react'
import ProgressWrapper from './ProgressWrapper'
import { GlobalStoriesCtx, ProgressCtx } from '@/types/stories.types.ts';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import ProgressContext from '@/components/Stories/context/ProgressContext.ts';
import css from '@/components/Stories/Progress/Progress.module.css';

interface ProgressProps {
    width: number;
    active: number;
    count: number;
}

const Progress: React.FC<ProgressProps> =  (props ) => {
    const { progressStyles } = useContext<GlobalStoriesCtx>(GlobalStoriesContext);
    const { bufferAction, pause } = useContext<ProgressCtx>(ProgressContext)
    const { width, active } = props

    const getProgressStyle = ({ active }: {active: number}) => {
        switch (active) {
            case 2:
                return { width: '100%' }
            case 1:
                return { transform: `scaleX(${props.count / 100})` }
            case 0:
                return { width: 0 }
            default:
                return { width: 0 }
        }
    }

    return (
        <ProgressWrapper width={width} pause={pause} bufferAction={bufferAction}>
            <div
                className={css.inner}
                style={{
                    ...progressStyles,
                    ...getProgressStyle({ active }),
                }}
            />
        </ProgressWrapper>
    )
}

export default Progress;
