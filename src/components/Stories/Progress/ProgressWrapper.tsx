import React from 'react';
import css from '@/components/Stories/Progress/Progress.module.css';

interface ProgressWrapperProps {
    children: any;
    width: number;
    pause: boolean;
    bufferAction: boolean;
}

const ProgressWrapper: React.FC<ProgressWrapperProps> = (props) => {

    return (
        <div
            className={css.progress}
            style={{
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
