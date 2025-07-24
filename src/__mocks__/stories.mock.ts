import {IStoriesGroupResponse} from "@/types/stories.ts";
import bbqlogo from '/img/BBQNEW.png';

export const mockedResponseFromFutureRequest: IStoriesGroupResponse[] = [
    {
        id: 'random-story-id',
        thumbnail: bbqlogo,
        stories: [
            {
                id: "",
                title: "ЗАБРОНИРУЙТЕ СТОЛ",
                url: 'https://caesai.github.io/dm_front/img/onboarding/background.png',
                description: "Учтем все пожелания, отправим подтверждение в чат и\n ждем встречи с вами.",
                button_url: "",
                button_text: "",
                button_color: "",
            }
        ]
    }
];
