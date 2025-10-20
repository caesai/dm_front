import React from 'react';
import { GlobalStoriesCtx } from '@/types/stories.types.ts';

export const initialContext = {
    defaultInterval: 4000,
    width: 360,
    height: 640,
    shouldWait: true,
};

const GlobalStoriesContext = React.createContext<GlobalStoriesCtx>(initialContext);

export default GlobalStoriesContext;
