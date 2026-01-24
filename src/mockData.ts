import { IMenuItem } from '@/pages/RestaurantPage/RestaurantPage.types.ts';
// import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// import { IRestaurant } from '@/types/restaurant.types.ts';
// import { ICity } from '@/atoms/cityListAtom.ts';

export const BOOKING_DURATION = 120; // in minutes

export const mockMenu: IMenuItem[] = [
    {
        title: 'Крем - суп из пастернака 1',
        photo: '/img/placeholder_4.png',
        price: 1000,
    },
    {
        title: 'Крем - суп из пастернака 2',
        photo: '/img/placeholder_4.png',
        price: 1100,
    },
    {
        title: 'Крем - суп из пастернака 3',
        photo: '/img/placeholder_4.png',
        price: 1200,
    },
    {
        title: 'Крем - суп из пастернака 4',
        photo: '/img/placeholder_4.png',
        price: 1300,
    },
];

export const mockBookingDate = new Date();

// export const MockTimeSlots: ITimeSlot[] = [
//     {
//         id: 1,
//         time: '9:00',
//     },
//     {
//         id: 2,
//         time: '9:30',
//     },
//     {
//         id: 3,
//         time: '9:45',
//     },
//     {
//         id: 4,
//         time: '10:00',
//     },
//     {
//         id: 5,
//         time: '10:15',
//     },
//     {
//         id: 6,
//         time: '10:30',
//     },
//     {
//         id: 7,
//         time: '10:45',
//     },
//     {
//         id: 8,
//         time: '11:00',
//     },
//     {
//         id: 9,
//         time: '11:15',
//     },
//     {
//         id: 10,
//         time: '11:30',
//     },
//     {
//         id: 11,
//         time: '11:45',
//     },
//     {
//         id: 12,
//         time: '12:00',
//     },
//     {
//         id: 13,
//         time: '12:15',
//     },
//     {
//         id: 14,
//         time: '12:30',
//     },
//     {
//         id: 15,
//         time: '12:45',
//     },
//     {
//         id: 16,
//         time: '13:00',
//     },
//     {
//         id: 17,
//         time: '13:15',
//     },
//     {
//         id: 18,
//         time: '13:30',
//     },
//     {
//         id: 19,
//         time: '13:45',
//     },
//     {
//         id: 20,
//         time: '14:00',
//     },
//     {
//         id: 21,
//         time: '14:15',
//     },
//     {
//         id: 22,
//         time: '14:30',
//     },
//     {
//         id: 23,
//         time: '14:45',
//     },
//     {
//         id: 24,
//         time: '15:00',
//     },
//     {
//         id: 25,
//         time: '15:15',
//     },
//     {
//         id: 26,
//         time: '15:30',
//     },
//     {
//         id: 27,
//         time: '15:45',
//     },
//     {
//         id: 28,
//         time: '16:00',
//     },
//     {
//         id: 29,
//         time: '16:15',
//     },
//     {
//         id: 30,
//         time: '16:30',
//     },
//     {
//         id: 31,
//         time: '16:45',
//     },
//     {
//         id: 32,
//         time: '17:00',
//     },
//     {
//         id: 33,
//         time: '17:15',
//     },
//     {
//         id: 34,
//         time: '17:30',
//     },
//     {
//         id: 35,
//         time: '17:45',
//     },
//     {
//         id: 36,
//         time: '18:00',
//     },
//     {
//         id: 37,
//         time: '18:15',
//     },
//     {
//         id: 38,
//         time: '18:30',
//     },
//     {
//         id: 39,
//         time: '18:45',
//     },
//     {
//         id: 40,
//         time: '19:00',
//     },
//     {
//         id: 41,
//         time: '20:15',
//     },
//     {
//         id: 42,
//         time: '20:30',
//     },
//     {
//         id: 43,
//         time: '20:45',
//     },
//     {
//         id: 44,
//         time: '21:00',
//     },
//     {
//         id: 45,
//         time: '21:15',
//     },
//     {
//         id: 46,
//         time: '21:30',
//     },
//     {
//         id: 47,
//         time: '21:45',
//     },
// ];

export const BOOKINGCOMMENTMOCK = [
    {
        text: 'День рождения',
        emoji: '🎂',
    },
    {
        text: 'Свидание',
        emoji: '❤️',
    },
    {
        text: 'Деловая встреча',
        emoji: '🤝',
    },
    {
        text: 'Годовщина',
        emoji: '🥂',
    },
    {
        text: 'Семейный ужин',
        emoji: '🫶',
    },
    {
        text: 'Буду с животным',
        emoji: '🐶',
    },
    // {
    //     text: 'Стол в тихой зоне',
    //     emoji: '😴',
    // },
];

/**
 * Возвращает список комментариев к бронированию на основе ID ресторана.
 *
 * @param {string} restaurant_id - Идентификатор ресторана.
 * @returns {Array<{text: string, emoji: string}>} - Массив комментариев к бронированию,
 * где каждый комментарий содержит текстовое описание и соответствующий emoji.
 */
export const getBookingCommentMock = (restaurant_id: string) => {
    const SELF_EDGE_JAPANESE_RESTAURANT_IDS = ['4', '7', '10'];

    // Self Edge Japanese
    if (SELF_EDGE_JAPANESE_RESTAURANT_IDS.includes(restaurant_id)) {
        return BOOKINGCOMMENTMOCK;
    }

    // Other restaurants
    return [
        ...BOOKINGCOMMENTMOCK,
        {
            text: 'Нужен детский стул',
            emoji: '👶',
        },
    ];
};

export const BOOKING_DATE_VALUES = <PickerValueObj[]>[
    {
        title: 'Сегодня, 16 марта',
        value: '2025-03-16',
    },
    {
        title: 'Завтра, 17 марта',
        value: '2025-03-17',
    },
    {
        title: '19 марта',
        value: '2025-03-19',
    },
    {
        title: '20 марта',
        value: '2025-03-20',
    },
    {
        title: '21 марта',
        value: '2025-03-21',
    },
    {
        title: '22 марта',
        value: '2025-03-22',
    },
    {
        title: '23 марта',
        value: '2025-03-23',
    },
    {
        title: '24 марта',
        value: '2025-03-24',
    },
];

const GUESTS_MAX_NUMBER: Record<string, number> = {
    '1': 12, // Blackchops SPb
    '2': 8, // Poly SPb
    '3': 12, // Trappist SPb
    '4': 8, // Self Edge SPb
    '5': 12, // Pame SPb
    '6': 8, // Smoke BBQ SPb
    '7': 8, // Self Edge Ekat
    '9': 8, // Smoke BBQ Msc
    '10': 8, // Self Edge Msc
};

export const getGuestMaxNumber = (restaurant_id: string | undefined) => {
    const defaultValue = 9;
    let res;
    if (restaurant_id !== undefined) {
        res = GUESTS_MAX_NUMBER[restaurant_id];
    }
    return res ?? defaultValue;
};

export const SERVICE_FEE_DATA: Record<string, { persons: number; fee: number }> = {
    // У ресторана Pame SPb нет сервисного сбора за гостей
    '1': { persons: 8, fee: 10 }, // Blackchops SPb
    '2': { persons: 8, fee: 10 }, // Poly SPb
    '3': { persons: 8, fee: 10 }, // Trappist SPb
    '4': { persons: 6, fee: 10 }, // Self Edge SPb
    '6': { persons: 8, fee: 10 }, // Smoke BBQ SPb
    '7': { persons: 6, fee: 10 }, // Self Edge Ekat
    '9': { persons: 8, fee: 10 }, // Smoke BBQ Msc
    '10': { persons: 6, fee: 10 }, // Self Edge Msc
    '11': { persons: 8, fee: 10 }, // Smoke BBQ SPb New
};

export const getServiceFeeData = (restaurant_id: string | undefined) => {
    if (restaurant_id !== undefined) {
        const feeData = SERVICE_FEE_DATA[restaurant_id];
        if (feeData !== undefined) {
            return `Для компаний от ${feeData.persons} и более гостей мы включаем сервисный сбор ${feeData.fee}% к общей сумме чека. Дети до 12 лет включительно не учитываются.`;
        }
    }
    return '';
};

// const MOCK_MSK = <ICity>{
//     id: 1,
//     name: 'Москва',
//     name_english: 'moscow',
//     name_dative: 'Москве',
// };
// const MOCK_SPB = <ICity>{
//     id: 2,
//     name: 'Санкт-Петербург',
//     name_english: 'spb',
//     name_dative: 'Санкт-Петербург',
// };
// const MOCK_EKB = <ICity>{
//     id: 3,
//     name: 'Екатеринбург',
//     name_english: 'ekb',
//     name_dative: 'Екатеринбурге',
// };

// export const MOCK_Restaurants = <IRestaurant[]>[
//     {
//         id: 1,
//         title: 'Smoke BBQ',
//         slogan: 'Бар · гриль · коптильня',
//         address: 'Санкт-Петербург, ул. Рубинштейна, 11',
//         logo_url: '/img/res/Smoke_BBQ/logo.png',
//         thumbnail_photo: '/img/res/Smoke_BBQ/main.jpg',
//         photo_cards: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish3.jpg',
//             },
//         ],
//         openTime: '00:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Владимир Смоляков',
//             photo_url: '/img/res/Smoke_BBQ/chef.jpg',
//             about:
//                 'Алексей Каневский, шеф-повар во втором поколении, в течение последних 15 лет работал только в самых престижных ресторанах вместе Аленом Дюкассом, Пьером Эрме, Эваном Ле Роей и др.\n' +
//                 'Искусству техасского барбекю обучался в Америке: от метода разделки мяса на заводе до приготовления брискета на специализированном оборудовании. А затем вместе с Алексеем Буровым привез эту технологию в Россию, заложив основы нового гастрономического направления — барбекю.\n' +
//                 'А увлечение технологией барбекю и дуговой сваркой его привело к созданию собственного парка BBQ-оборудования DREAMTEAM. Смокеры, грили, коптильни и печи используются для выездного кейтеринга, консалтинга и фестивалей. Самый масштабный из них — Smoke & Fire — в 2019 году собрал 40 000 поклонников барбекю в Петербурге.\n',
//         },
//         city: MOCK_SPB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish6.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int1.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int2.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int3.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int4.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int5.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink1.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink2.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink3.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink4.jpg',
//             },
//             {
//                 id: 16,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink5.jpg',
//             },
//             {
//                 id: 17,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink6.jpg',
//             },
//         ],
//         about_text:
//             'Ресторан с концепцией ultimate firewood cooking с грилем, печью и смокером. Это настоящая мясная достопримечательность Петербурга. Главный специалитет — брискет, говяжья грудинка, которую мы коптим в смокере в течение 14–16 часов до совершенного вкуса и текстуры. Технологию приготовления бренд-шеф Алексей Каневский привез из Остина, штат Техас. На огне готовим не только мясо, но и рыбу, овощи и морепродукты.',
//         about_dishes: 'Мясо, Рыба и морепродукты',
//         about_kitchen: 'Американская, Европейская',
//         about_features: 'Обеды, Бранчи, Веранда',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '15:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '12:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '12:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '30.344282,59.929824',
//         address_station: 'м. Достоевская',
//         address_station_color: 'rgb(234, 113, 37)',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/smokebbqmoscow',
//                 name: 'smokebbqmoscow',
//             },
//         ],
//     },
//     {
//         id: 2,
//         title: 'Self Edge Japanese',
//         slogan: 'Рыба · Вино',
//         address: 'Санкт-Петербург, ул. Радищева, 34',
//         logo_url: '/img/res/SEJ/Logo.png',
//         thumbnail_photo: '/img/res/SEJ/main.jpg',
//         photo_cards: [
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish1.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish2.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Дмитрий Тян',
//             photo_url: '/img/res/SEJ/chef.jpg',
//             about:
//                 'Дмитрий Тян, шеф-повар с более чем 20-летним опытом работы в ресторанах и сетях доставки японской кухни. В Петербурге он руководил кухней Sintoho (Four Seasons), где работал с премиальными продуктами и перенимал опыт у иностранных шефов. \n' +
//                 '\n' +
//                 'В 2020 году участвовал в запуске доставки Duoband Дмитрия Блинова, а позже стал бренд-шефом Self Edge Japanese в Петербурге, Екатеринбурге и Москве.\n' +
//                 'Каждый месяц в Self Edge Japanese он проводит омакасе-ужины, где гости могут пообщаться с ним и попробовать блюда вне меню: редкую рыбу и морепродуктами высочайшего качества. \n',
//         },
//         city: MOCK_SPB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish6.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish7.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish8.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish9.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/1-100.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/2-100.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/3-100.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/4-100.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/5-100.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/6-100.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/1.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/2.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/3.jpg',
//             },
//             {
//                 id: 16,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/4.jpg',
//             },
//             {
//                 id: 17,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/5.jpg',
//             },
//         ],
//         about_text:
//             'Современный японский ресторан, где во главе — максимально качественная рыба, морепродукты, вагю, а также самая яркая в России коллекция саке, нетривиальная винная карта с оглядкой на модные тренды и Старый Свет, а также коктейли с азиатским подтекстом.  \n' +
//             'С четверга по субботу — Fishmarket с редкой рыбой и морепродуктами со всего мира: свежие устрицы с острова Хоккайдо, гребешки и кальмары с Сахалина, краба с Камчатки, а тунец и хамачи с лучших японских рынков.\n' +
//             'Каждый месяц проводим омакасе-ужины (с японского — «полагаюсь на вас»), которые проходят без заранее подготовленного меню — гостям нужно лишь довериться выбору шеф-повара и получить удовольствие от совершенно нового опыта. \n' +
//             'Надо предусмотреть техническую возможность перейти на экран покупки билета на Омакасе ужин.\n',
//         about_dishes: 'Рыба и морепродукты',
//         about_kitchen: 'Японская, Азиатская',
//         about_features: 'Fishmarket, Омакасе, Саке клуб, Izakaya Party',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '13:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '13:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '13:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '30.363308,59.941317',
//         address_station: 'м. Чернышевская',
//         address_station_color: 'rgb(214, 8, 59)',
//         socials: [
//             {
//                 type: 'instagram',
//                 name: 'selfedgejapanese.stpete',
//                 url: 'https://www.instagram.com/selfedgejapanese.stpete',
//             },
//         ],
//     },
//     {
//         id: 3,
//         title: 'Blackchops',
//         slogan: 'Мясной ресторан в британском стиле',
//         address: 'Санкт-Петербург, наб. реки Фонтанки, 5/2',
//         logo_url: '/img/res/Blackchops/logo.jpg',
//         thumbnail_photo: '/img/res/Blackchops/main.jpg',
//         photo_cards: [
//             {
//                 id: 7,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish1.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish2.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Илья Бурнасов',
//             photo_url: '/img/res/Blackchops/chef.jpg',
//             about:
//                 'Илья Бурнасов, шеф-повар с 17-летним опытом в ресторанной индустрии Петербурга, участник престижных гастрономических фестивалей и стажировок в Лондоне и Москве.\n' +
//                 'Свои первые шаги в профессии он сделал в Ginza Project, где принимал участие в запуске новых ресторанов. Затем возглавил кухню SPA-курорта «Президент-Отель», а позже стал бренд-шефом таких известных проектов, как Hitch, Locale, «Ателье. Tapas & Bar» и концепт-шефом PioNero.\n' +
//                 'Проходил стажировки в White Rabbit, а также в лондонских Beats, Zelman Meats, Burger & Lobster. Финалист всероссийского конкурса «На высоте» (2017), участник Madrid Fusion (2018). Преподавал в Novikov Space.\n',
//         },
//         city: MOCK_SPB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/Blackchops/Блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Интерьер',
//                 url: '/img/res/Blackchops/Интерьер/int1.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/Blackchops/Интерьер/int2.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/Blackchops/Интерьер/int3.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/Blackchops/Интерьер/int4.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/Blackchops/Интерьер/int5.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Напитки',
//                 url: '/img/res/Blackchops/Напитки/1.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Напитки',
//                 url: '/img/res/Blackchops/Напитки/2.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/Blackchops/Напитки/3.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/Blackchops/Напитки/4.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/Blackchops/Напитки/5.jpg',
//             },
//         ],
//         about_text:
//             'Современный паб и мясной ресторан в британском стиле с видом на Цирк и мост Белинского. Бренд-шеф Илья Бурнасов на кухне исполняет британскую классику и подает портерхаус, Веллингтон и стейки на кости в современной эстетике. За баром льют пиво от собственной пивоварни и классику жанра: пилснер, лагер, ирландский стаут, янтарный эль и ламбик. Отдельная гордость — обширная винная карта, канонические джин-тоники и редкие виски из коллекции.  \n' +
//             '\n' +
//             'Завтраки сервируем каждый день с 9:00 до 12:00, в выходные — с 9:00 до 17:00.\n' +
//             'С четверга по воскресенье — устрицы с бокалом стаута или джина, по субботам — Веллингтон из говяжьей вырезки, а в воскресенье — бранч Sunday Roast. \n' +
//             'Раз в месяц — вечеринка Sound System с брит-попом на виниле.\n',
//         about_dishes: ' Мясо, Рыба и морепродукты',
//         about_kitchen: 'Британская ',
//         about_features: 'Завтраки, Бранчи',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '09:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '09:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '09:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '09:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '09:00',
//                 time_end: '02:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '09:00',
//                 time_end: '02:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '09:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '30.342485,59.937786',
//         address_station: 'м. Гостинный двор',
//         address_station_color: 'rgb(0, 154, 73)',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/blackchopspub',
//                 name: 'blackchopspub',
//             },
//         ],
//     },
//     {
//         id: 4,
//         title: 'Pame',
//         slogan: 'Настоящая греческая таверна',
//         address: 'Санкт-Петербург, наб. реки Мойки, 3',
//         logo_url: '/img/res/Pame/logo.jpg',
//         thumbnail_photo: '/img/res/Pame/main.jpg',
//         photo_cards: [
//             {
//                 id: 10,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish1.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish2.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Марсель Хабиров',
//             photo_url: '/img/res/Pame/chef.jpg',
//             about:
//                 'Марсель Хабиров начал карьеру в родной Уфе, в «Доме башкирской кухни», «Пышке» и «Домино». Важный этапом в его карьере стал переезд в Петербург — Марсель стал частью команды ресторана Beef Zavod, где работал вместе с Романом Палкиным и Максимом Торгановым и освоил концепцию «от носа до хвоста». Затем работал в Art-caviar,  где занимался созданием блюд  с черной икрой и осетровыми. \n' +
//                 'Прошел стажировку в Сан-Себастьяне (Испания) у Дмитрия Модестова в Takatak, изучая работу с рыбой и морепродуктами. Вернувшись в Россию, присоединился к команде Artel в Казани, где за год вырос до шеф-повара и возглавлял кухню три года.\n',
//         },
//         city: MOCK_SPB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/Pame/Блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Интерьер',
//                 url: '/img/res/Pame/Интерьер/1.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/Pame/Интерьер/2.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/Pame/Интерьер/3.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/Pame/Интерьер/4.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/Pame/Интерьер/5.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/1.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/2.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/3.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/4.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/5.jpg',
//             },
//         ],
//         about_text:
//             'Настоящая греческая таверна с искренним гостеприимством и традицией греческого застолья в здании Круглого рынка. Главное здесь — греческие продукты: фета PDO и йогурт, орегано, каперсы, оливки, а также сезонные овощи, фрукты и ягоды с рынков и ферм. В меню — мезедес, греческие кебаб и томагавк, салат Хориатики, всегда свежая рыба с морепродуктами и греческие десерты.\n' +
//             'В винной карте — подборка из Старого Света, Санторини и материковой Греции. В барной карте — коктейльные твисты со средиземноморским вайбом и греческие дижестивы.\n' +
//             'По выходным с 11:00 до 17:00 — семейные бранчи, а с четверга по воскресенье — рыбная лавка со свежей рыбой и морепродуктами.\n',
//         about_dishes: 'Мясо, рыба и морепродукты',
//         about_kitchen: 'Греческая ',
//         about_features: 'Рыбная лавка, Обеды, Бранчи, Зал для мероприятий',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '11:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '11:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '30.327626,59.942721',
//         address_station: 'м. Гостинный двор',
//         address_station_color: 'rgb(0, 154, 73)',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/pametaverna',
//                 name: 'pametaverna',
//             },
//         ],
//     },
//     {
//         id: 5,
//         title: 'Траппист',
//         slogan: 'Бельгийское пиво · морепродукты',
//         address: 'Санкт-Петербург, ул. Радищева, 36',
//         logo_url: '/img/res/Trappist/logo.jpg',
//         thumbnail_photo: '/img/res/Trappist/main.jpg',
//         photo_cards: [
//             {
//                 id: 13,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/1.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/2.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Роман Клюквин',
//             photo_url: '/img/res/Trappist/chef.jpg',
//             about:
//                 'Роман Клюквин — шеф-повар-самоучка, чье кулинарное становление прошло без традиционных стажировок. После окончания кулинарного колледжа он продолжил развиваться самостоятельно, изучая гастрономию через книги, интернет и наблюдая за работой ведущих шеф-поваров мира.\n' +
//                 'Карьера началась в 2016 году с работы в The Safe. В 2018 году Роман присоединился к проекту «Летучий голландец», а в 2019 году стал бренд-шефом Футура Бистро, где значительно вырос как профессионал. Именно здесь он сформировал собственный стиль и гастрономическое видение.\n' +
//                 'Параллельно Роман консультировал другие проекты, а также полностью разработал концепцию и продукт для сети кофеен Drinkit.\n' +
//                 'В 2019 году принял участие в чемпионате Chef Ala Russe, а в 2024 году выступил в качестве спикера на Megustro.\n',
//         },
//         city: MOCK_SPB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/Trappist/Блюда/5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Интерьер',
//                 url: '/img/res/Trappist/Интерьер/1.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/Trappist/Интерьер/2.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/Trappist/Интерьер/3.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/Trappist/Интерьер/4.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/Trappist/Интерьер/5.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Напитки',
//                 url: '/img/res/Trappist/Напитки/1.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Напитки',
//                 url: '/img/res/Trappist/Напитки/2.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/Trappist/Напитки/3.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/Trappist/Напитки/4.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/Pame/Напитки/5.jpg',
//             },
//         ],
//         about_text:
//             'Современная городская брассерия, какой она и должна быть: с большой коллекцией пива и свежими морепродуктами. Продуманная система хранения и подачи пива позволяет наливать его быстро, качественно  — с нужной температурой и пышной пенной шапкой. В Aging room выдерживаются самое большое в России собрание элей, гёзов, ламбиков и сидров. А для каждого сорта пива здесь предусмотрен свой бокал для полного раскрытия вкуса.\n' +
//             'В меню: свежая рыба и морепродукты (устрицы, мидии, ежи, креветки), наши фирменные картофельные вафли по рецепту, который не менялся уже более 10 лет, а также блюда с швейцарским сыром раклет и традиционный бельгийский картофель с закусками. \n' +
//             'По выходным с 12:00 до 17:00 — семейные бранчи, а с четверга по пятницу — Гранд четверги (спешл по кухне и бару). \n',
//         about_dishes: 'Рыба и морепродукты, Мясо',
//         about_kitchen: 'Бельгийская, Французская',
//         about_features: 'Бранчи, Веранда',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '12:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '12:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '30.363435,59.941539',
//         address_station: 'м. Чернышевская',
//         address_station_color: 'rgb(214, 8, 59)',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/trappistbrasserie',
//                 name: 'trappistbrasserie',
//             },
//         ],
//     },
//     {
//         id: 6,
//         title: 'Self Edge Japanese',
//         slogan: 'Рыба · Вино',
//         address: 'Москва, Большая Грузинская ул., 76, стр. 2',
//         logo_url: '/img/res/SEJ/Logo.png',
//         thumbnail_photo: '/img/res/SEJ/main.jpg',
//         photo_cards: [
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish1.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish2.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Дмитрий Тян',
//             photo_url: '/img/res/SEJ/chef.jpg',
//             about:
//                 'Дмитрий Тян, шеф-повар с более чем 20-летним опытом работы в ресторанах и сетях доставки японской кухни. В Петербурге он руководил кухней Sintoho (Four Seasons), где работал с премиальными продуктами и перенимал опыт у иностранных шефов. \n' +
//                 '\n' +
//                 'В 2020 году участвовал в запуске доставки Duoband Дмитрия Блинова, а позже стал бренд-шефом Self Edge Japanese в Петербурге, Екатеринбурге и Москве.\n' +
//                 'Каждый месяц в Self Edge Japanese он проводит омакасе-ужины, где гости могут пообщаться с ним и попробовать блюда вне меню: редкую рыбу и морепродуктами высочайшего качества. \n',
//         },
//         city: MOCK_MSK,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/МСК/Блюда/dish6.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/1-100.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/2-100.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/3-100.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/4-100.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/5-100.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/МСК/Интерьер/6-100.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/МСК/Коктейли/1.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/МСК/Коктейли/2.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/МСК/Коктейли/3.jpg',
//             },
//             {
//                 id: 16,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/МСК/Коктейли/4.jpg',
//             },
//             {
//                 id: 17,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/МСК/Коктейли/5.jpg',
//             },
//         ],
//         about_text:
//             'Современный японский ресторан, где во главе — максимально качественная рыба, морепродукты, вагю, а также самая яркая в России коллекция саке, нетривиальная винная карта с оглядкой на модные тренды и Старый Свет, а также коктейли с азиатским подтекстом.  \n' +
//             'С четверга по субботу — Fishmarket с редкой рыбой и морепродуктами со всего мира: свежие устрицы с острова Хоккайдо, гребешки и кальмары с Сахалина, краба с Камчатки, а тунец и хамачи с лучших японских рынков.\n' +
//             'Каждый месяц проводим омакасе-ужины (с японского — «полагаюсь на вас»), которые проходят без заранее подготовленного меню — гостям нужно лишь довериться выбору шеф-повара и получить удовольствие от совершенно нового опыта. \n' +
//             'Надо предусмотреть техническую возможность перейти на экран покупки билета на Омакасе ужин.\n',
//         about_dishes: 'Рыба и морепродукты',
//         about_kitchen: 'Японская, Азиатская',
//         about_features: 'Fishmarket, Омакасе, Саке клуб, Izakaya Party',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '13:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '13:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '13:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '13:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '13:00',
//                 time_end: '02:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '13:00',
//                 time_end: '02:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '13:00',
//                 time_end: '00:00',
//             },
//         ],
//         address_lonlng: '37.587007,55.773711',
//         address_station: 'м. Белорусская',
//         address_station_color: '#8D5B2D',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/selfedgejapanese.moscow',
//                 name: 'selfedgejapanese.moscow',
//             },
//         ],
//     },
//     {
//         id: 7,
//         title: 'Self Edge Japanese',
//         slogan: 'Рыба · Вино',
//         address: 'Екатеринбург, ул. Гоголя, 18',
//         logo_url: '/img/res/SEJ/Logo.png',
//         thumbnail_photo: '/img/res/SEJ/main.jpg',
//         photo_cards: [
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish1.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish2.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish3.jpg',
//             },
//         ],
//         openTime: '23:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Дмитрий Тян',
//             photo_url: '/img/res/SEJ/chef.jpg',
//             about:
//                 'Дмитрий Тян, шеф-повар с более чем 20-летним опытом работы в ресторанах и сетях доставки японской кухни. В Петербурге он руководил кухней Sintoho (Four Seasons), где работал с премиальными продуктами и перенимал опыт у иностранных шефов. \n' +
//                 '\n' +
//                 'В 2020 году участвовал в запуске доставки Duoband Дмитрия Блинова, а позже стал бренд-шефом Self Edge Japanese в Петербурге, Екатеринбурге и Москве.\n' +
//                 'Каждый месяц в Self Edge Japanese он проводит омакасе-ужины, где гости могут пообщаться с ним и попробовать блюда вне меню: редкую рыбу и морепродуктами высочайшего качества. \n',
//         },
//         city: MOCK_EKB,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish6.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish7.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish8.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Блюда',
//                 url: '/img/res/SEJ/СПБ/Блюда/dish9.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/1-100.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/2-100.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/3-100.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/4-100.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/5-100.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Интерьер',
//                 url: '/img/res/SEJ/СПБ/Интерьер/6-100.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/1.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/2.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/3.jpg',
//             },
//             {
//                 id: 16,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/4.jpg',
//             },
//             {
//                 id: 17,
//                 category: 'Напитки',
//                 url: '/img/res/SEJ/СПБ/Коктейли/5.jpg',
//             },
//         ],
//         about_text:
//             'Современный японский ресторан, где во главе — максимально качественная рыба, морепродукты, вагю, а также самая яркая в России коллекция саке, нетривиальная винная карта с оглядкой на модные тренды и Старый Свет, а также коктейли с азиатским подтекстом.  \n' +
//             'С четверга по субботу — Fishmarket с редкой рыбой и морепродуктами со всего мира: свежие устрицы с острова Хоккайдо, гребешки и кальмары с Сахалина, краба с Камчатки, а тунец и хамачи с лучших японских рынков.\n' +
//             'Каждый месяц проводим омакасе-ужины (с японского — «полагаюсь на вас»), которые проходят без заранее подготовленного меню — гостям нужно лишь довериться выбору шеф-повара и получить удовольствие от совершенно нового опыта. \n' +
//             'Надо предусмотреть техническую возможность перейти на экран покупки билета на Омакасе ужин.\n',
//         about_dishes: 'Рыба и морепродукты',
//         about_kitchen: 'Японская, Азиатская',
//         about_features: 'Fishmarket, Омакасе, Саке клуб, Izakaya Party',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '17:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '13:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '13:00',
//                 time_end: '01:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '13:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '60.609793,56.833225',
//         address_station: 'м. Геологическая',
//         address_station_color: 'green',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/selfedgejapanese.moscow',
//                 name: 'selfedgejapanese.moscow',
//             },
//         ],
//     },
//     {
//         id: 8,
//         title: 'Smoke BBQ',
//         slogan: 'Бар · гриль · коптильня',
//         address: 'Москва, Трубная ул., 18',
//         logo_url: '/img/res/Smoke_BBQ/logo.png',
//         thumbnail_photo: '/img/res/Smoke_BBQ_Msk/main.jpg',
//         photo_cards: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish3.jpg',
//             },
//         ],
//         openTime: '00:00',
//         avg_cheque: 1500,
//         brand_chef: {
//             name: 'Алексей Каневский',
//             photo_url: '/img/res/Smoke_BBQ_Msk/chef.jpg',
//             about:
//                 'Алексей Каневский, шеф-повар во втором поколении, в течение последних 15 лет работал только в самых престижных ресторанах вместе Аленом Дюкассом, Пьером Эрме, Эваном Ле Роей и др.\n' +
//                 'Искусству техасского барбекю обучался в Америке: от метода разделки мяса на заводе до приготовления брискета на специализированном оборудовании. А затем вместе с Алексеем Буровым привез эту технологию в Россию, заложив основы нового гастрономического направления — барбекю.\n' +
//                 'А увлечение технологией барбекю и дуговой сваркой его привело к созданию собственного парка BBQ-оборудования DREAMTEAM. Смокеры, грили, коптильни и печи используются для выездного кейтеринга, консалтинга и фестивалей. Самый масштабный из них — Smoke & Fire — в 2019 году собрал 40 000 поклонников барбекю в Петербурге.\n',
//         },
//         city: MOCK_MSK,
//         gallery: [
//             {
//                 id: 1,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish1.jpg',
//             },
//             {
//                 id: 2,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish2.jpg',
//             },
//             {
//                 id: 3,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish3.jpg',
//             },
//             {
//                 id: 4,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish4.jpg',
//             },
//             {
//                 id: 5,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish5.jpg',
//             },
//             {
//                 id: 6,
//                 category: 'Блюда',
//                 url: '/img/res/Smoke_BBQ/блюда/dish6.jpg',
//             },
//             {
//                 id: 7,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int1.jpg',
//             },
//             {
//                 id: 8,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int2.jpg',
//             },
//             {
//                 id: 9,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int3.jpg',
//             },
//             {
//                 id: 10,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int4.jpg',
//             },
//             {
//                 id: 11,
//                 category: 'Интерьер',
//                 url: '/img/res/Smoke_BBQ/интерьер/int5.jpg',
//             },
//             {
//                 id: 12,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink1.jpg',
//             },
//             {
//                 id: 13,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink2.jpg',
//             },
//             {
//                 id: 14,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink3.jpg',
//             },
//             {
//                 id: 15,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink4.jpg',
//             },
//             {
//                 id: 16,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink5.jpg',
//             },
//             {
//                 id: 17,
//                 category: 'Напитки',
//                 url: '/img/res/Smoke_BBQ/напитки/drink6.jpg',
//             },
//         ],
//         about_text:
//             'Ресторан с концепцией ultimate firewood cooking с грилем, печью и смокером. Это настоящая мясная достопримечательность Петербурга. Главный специалитет — брискет, говяжья грудинка, которую мы коптим в смокере в течение 14–16 часов до совершенного вкуса и текстуры. Технологию приготовления бренд-шеф Алексей Каневский привез из Остина, штат Техас. На огне готовим не только мясо, но и рыбу, овощи и морепродукты.',
//         about_dishes: 'Мясо, Рыба и морепродукты',
//         about_kitchen: 'Американская, Европейская',
//         about_features: 'Обеды, Бранчи, Веранда',
//         menu: [],
//         worktime: [
//             {
//                 weekday: 'Пн',
//                 time_start: '15:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Вт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Ср',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Чт',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//             {
//                 weekday: 'Пт',
//                 time_start: '12:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Сб',
//                 time_start: '12:00',
//                 time_end: '00:00',
//             },
//             {
//                 weekday: 'Вс',
//                 time_start: '12:00',
//                 time_end: '23:00',
//             },
//         ],
//         address_lonlng: '37.625285,55.769541',
//         address_station: 'м. Трубная',
//         address_station_color: '#99CC00',
//         socials: [
//             {
//                 type: 'instagram',
//                 url: 'https://www.instagram.com/smokebbqmoscow',
//                 name: 'smokebbqmoscow',
//             },
//         ],
//     },
// ];

// smokebbq msk 37.625285,55.769541
