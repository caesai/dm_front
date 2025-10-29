import { StoriesAction, StoriesState } from '@/types/stories.types.ts';

type Action =
    | { type: StoriesAction.SetCurrentId; payload: number }
    | { type: StoriesAction.Next; payload: { loop?: boolean; storiesLength: number } }
    | { type: StoriesAction.Previous };

export const storiesReducer = (state: StoriesState, action: Action): StoriesState => {
    switch (action.type) {
        case StoriesAction.SetCurrentId:
            return { ...state, currentId: action.payload };
        case StoriesAction.Next:
            const { loop, storiesLength } = action.payload;
            const nextId = (state.currentId + 1);
            if (nextId < storiesLength) {
                return { ...state, currentId: nextId };
            }
            return { ...state, currentId: loop ? 0 : state.currentId };
        case StoriesAction.Previous:
            const prevId = (state.currentId - 1);
            return { ...state, currentId: Math.max(0, prevId) };
        default:
            return state;
    }
};
