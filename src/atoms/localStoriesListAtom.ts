import { atom } from 'jotai';
// import { splitAtom } from 'jotai/utils';

export interface ILocalStory {
    id: number;
    index: number;
    isSeen: boolean;
}

export const localStoriesListAtom = atom<ILocalStory[]>([]);
// export const storyLocalAtomsAtom = splitAtom(storiesLocalAtom);
