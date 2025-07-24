import {IStoriesGroupResponse} from "@/types/stories.ts";
import {mockedResponseFromFutureRequest} from "@/__mocks__/stories.mock.ts";

export const ApiGetStoriesBlocks = (): Promise<() => IStoriesGroupResponse[]> => {
    // TODO: return axios get request
    return Promise.resolve(() => {
        return mockedResponseFromFutureRequest
    });
}
