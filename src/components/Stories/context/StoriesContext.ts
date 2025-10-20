import React from 'react';
import { IStoryObject } from '@/types/stories.types.ts';

export const initialContext: IStoryObject[] = [];

const StoriesContext = React.createContext<IStoryObject[]>(
    initialContext
);

export default StoriesContext;
