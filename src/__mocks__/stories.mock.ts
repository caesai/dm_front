import {IStoriesBlockResponse, IStory} from "@/types/stories.ts";
import bbqlogo from '/img/BBQNEW.png';
import placeholder from '/img/placeholder_1.png';
import stage3 from '/img/onboarding/stage3.png';

const mockedStories: IStory[] = [
    {
        id: "random-id",
        title: "ЗАБРОНИРУЙТЕ СТОЛ",
        url: 'https://caesai.github.io/dm_front/img/onboarding/background.png',
        description: "Учтем все пожелания, отправим подтверждение в чат и\n ждем встречи с вами.",
        button_url: "",
        button_text: "",
        button_color: "",
        type: "component",
        duration: 5000,
    },
    {
        id: "random-id",
        title: "Будьте в курсе всех мероприятий",
        url: stage3,
        description: "Учтем все пожелания, отправим подтверждение в чат и\n ждем встречи с вами.",
        button_url: "",
        button_text: "",
        button_color: "",
        type: "component",
        duration: 5000,
    },
    {
        id: "random-id",
        title: "",
        url: stage3,
        description: "",
        button_url: "",
        button_text: "",
        button_color: "",
        type: "image",
        duration: 5000,
    },
];

export const mockedResponseFromFutureRequest: IStoriesBlockResponse[] = [
    {
        id: '0',
        thumbnail: bbqlogo,
        stories: mockedStories,
        active: false,
        users: [],
        name: "random-story-name"
    },
    {
        id: '1',
        thumbnail: placeholder,
        stories: mockedStories,
        active: false,
        users: [],
        cities: [],
        name: "random-story-name"
    },
    {
        id: '2',
        thumbnail: placeholder,
        stories: mockedStories,
        active: false,
        users: [],
        cities: [],
        name: "random-story-name"
    },
    {
        id: '3',
        thumbnail: placeholder,
        stories: mockedStories,
        active: false,
        users: [],
        cities: [],
        name: "random-story-name"
    },
    {
        id: '4',
        thumbnail: placeholder,
        stories: mockedStories,
        active: false,
        users: [],
        cities: [],
        name: "random-story-name"
    },
    {
        id: '5',
        thumbnail: placeholder,
        stories: mockedStories,
        active: false,
        users: [],
        cities: [],
        name: "random-story-name"
    },
];
