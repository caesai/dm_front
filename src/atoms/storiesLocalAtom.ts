import { atom } from 'jotai';
// import { splitAtom } from 'jotai/utils';

interface IStoryLocalCount {
    id: string;
    count: number;
    isSeen: boolean;
}

export const storiesLocalCountAtom = atom<IStoryLocalCount[]>([]);
// export const storyLocalAtomsAtom = splitAtom(storiesLocalAtom);
