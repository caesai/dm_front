import {IStoriesBlockResponse} from "@/types/stories.ts";
import {mockedResponseFromFutureRequest} from "@/__mocks__/stories.mock.ts";

export const ApiGetStoriesBlocks = (): Promise<() => IStoriesBlockResponse[]> => {
    // TODO: return axios get request
    return Promise.resolve(() => {
        return mockedResponseFromFutureRequest
    });
}
