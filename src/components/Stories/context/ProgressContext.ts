import React from 'react'
import { ProgressCtx } from '@/types/stories.types.ts';

const ProgressContext = React.createContext<ProgressCtx>({
    currentId: 0,
    videoDuration: 5000,
    bufferAction: false,
    pause: false,
    next: () => {},
});

export default ProgressContext;
