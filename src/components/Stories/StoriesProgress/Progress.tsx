import React from 'react';
import ProgressWrapper from './ProgressWrapper';
import css from '@/components/Stories/StoriesProgress/Progress.module.css';

interface ProgressProps {
    width: number;
    active: number;
    count: number;
    pause: boolean;
    bufferAction: boolean;
}

const Progress: React.FC<ProgressProps> = (
    {
        width,
        active,
        pause,
        bufferAction,
        count,
    },
) => {

    const getProgressStyle = ({ active }: { active: number }) => {
        switch (active) {
            case 2:
                return { width: '100%' };
            case 1:
                return { transform: `scaleX(${count / 100})` };
            case 0:
                return { width: 0 };
            default:
                return { width: 0 };
        }
    };

    return (
        <ProgressWrapper width={width} pause={pause} bufferAction={bufferAction}>
            <div
                className={css.inner}
                style={{
                    ...getProgressStyle({ active }),
                }}
            />
        </ProgressWrapper>
    );
};

export default Progress;
