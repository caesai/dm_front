// atoms/localStoriesListAtom.ts
import { atomWithStorage } from 'jotai/utils';

// Define the type for a local story object
export interface ILocalStory {
    id: number;
    index: number;
    isSeen: boolean;
    lastSeenDate: string;
}

// Initialize the atom with an empty array.
export const localStoriesListAtom = atomWithStorage<ILocalStory[]>('localStories', []);
