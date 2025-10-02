import {
    IBanquet,
    IBanquetAdditionalOptions,
    IBanquetOptionsContainer,
    IBanquetParams,
} from '@/types/banquets.ts';

export const banquetData: IBanquet = {
    imageById: [
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/7e0092898a7a457c8ad9be0e00c3df89.jpg',
            restaurant_id: 1
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/256a086b546f40b589c8da0edaadf1dc.jpg',
            restaurant_id: 2
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/7a3efaa254ef4800846142ec2298cb70.jpg',
            restaurant_id: 3
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/a965b4b4559c47c3a778f7715cc590ae.jpg',
            restaurant_id: 4
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/31c2e547e39a487681747e0954a00ffc.jpg',
            restaurant_id: 5
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/466ebf19d72d4b2f94450a0c4cd8691a.jpg',
            restaurant_id: 6
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/a965b4b4559c47c3a778f7715cc590ae.jpg',
            restaurant_id: 7
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/0dff4c2ee8da43d1a1dfc0ca5c966e9b.jpg',
            restaurant_id: 8
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/a965b4b4559c47c3a778f7715cc590ae.jpg',
            restaurant_id: 9
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/d4fa1466780d435d96b90f637e5d43f2.jpg',
            restaurant_id: 10
        },
        {
            image_url: 'https://storage.yandexcloud.net/dreamteam-storage/d4fa1466780d435d96b90f637e5d43f2.jpg',
            restaurant_id: 11
        }
    ],
    description: 'Ваши значимые события в {RESTAURANT.NAME}: банкеты, частные мероприятия, семейные торжества, корпоративные и деловые встречи.'
}

export const banquetOptions: IBanquetOptionsContainer[] = [
    {
        restaurant_id: 1,
        options: [
            {
                id: 2136,
                name: "Зал у Камина (только будни)",
                guests_min: 10,
                guests_max: 20,
                deposit: 15000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/07f673b133a0433e88c6b0c4e8b603a3.jpeg",
            },
            {
                id: 2137,
                name: "Банкетная рассадка",
                guests_min: 8,
                guests_max: 12,
                deposit: 5000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/9eb420734c0c4f6d9240568f407e72ad.jpg",
            }
        ]
    },
    {
        restaurant_id: 2,
        options: [
            {  // Poly
                id: 2138,
                name: "Общий стол",
                guests_min: 6,
                guests_max: 10,
                deposit: 2500,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/70751e5df46446178e1ded4d30607517.jpg",
            },
            {
                id: 2139,
                name: "Банкетная рассадка в зале",
                guests_min: 25,
                guests_max: 40,
                deposit: 3000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/ae5f1c4bd8044c37998c39a885adcd6b.jpg",
            }
        ]
    },
    {
        restaurant_id: 3,
        options: []
    },
    {
        restaurant_id: 4,
        options: [{
            id: 2138,
            name: "Общий стол",
            guests_min: 6,
            guests_max: 10,
            deposit: 2500,
            deposit_message: null,
            service_fee: 10,
            image: "https://storage.yandexcloud.net/dreamteam-storage/70751e5df46446178e1ded4d30607517.jpg",
        },
            {
                id: 2139,
                name: "Банкетная рассадка в зале",
                guests_min: 25,
                guests_max: 40,
                deposit: 3000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/ae5f1c4bd8044c37998c39a885adcd6b.jpg",
            }]
    },
    {
        restaurant_id: 5,
        options: [
            {
                id: 2140,
                name: "Кабинет",
                guests_min: null,
                guests_max: 12,
                deposit: null,
                deposit_message: "Индивидуальные условия",
                service_fee: 0,
                image: "https://storage.yandexcloud.net/dreamteam-storage/2db2b6d8dec54f4a9ce6e0ad025dfed6.jpg",
            },
            {
                id: 2141,
                name: "Винный зал",
                guests_min: null,
                guests_max: 16,
                deposit_message: "Индивидуальные условия",
                service_fee: 0,
                image: "https://storage.yandexcloud.net/dreamteam-storage/a6f8225fca3a43ae816613e0a51b9b53.jpg",
            },
            {
                id: 2142,
                name: `Граунд "ШИК”`,
                guests_min: null,
                guests_max: 30,
                deposit_message: "Индивидуальные условия",
                service_fee: 0,
                image: "https://storage.yandexcloud.net/dreamteam-storage/bd7c9b3e8e5b4ac78a4f6d335c4468e6.jpg",
            }
        ]
    },
    {
        restaurant_id: 6,
        options: [
            {
                id: 2143,
                name: "Банкетная рассадка",
                guests_min: 9,
                guests_max: 11,
                deposit: 5000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/b83dfbba5d474da5bdb14c521e47a6b7.jpg",
            },
            {
                id: 2144,
                name: "Банкетная рассадка",
                guests_min: 12,
                guests_max: 18,
                deposit: 8000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/b83dfbba5d474da5bdb14c521e47a6b7.jpg",
            },
            {
                id: 2145,
                name: "Банкетная рассадка",
                guests_min: 19,
                guests_max: 35,
                deposit: 10000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/b83dfbba5d474da5bdb14c521e47a6b7.jpg",
            }

        ]
    },
    {
        restaurant_id: 7,
        options: []
    },
    {
        restaurant_id: 8,
        options: []
    },
    {
        restaurant_id: 9,
        options: [
            {
                id: 2146,
                name: "Общий стол (2 этаж)",
                guests_min: 12,
                guests_max: 16,
                deposit: 8500,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/4d6e1a1b81d34d3e9e851321780c6829.jpg",
            },
            {
                id: 2147,
                name: "Столы с диванами (1 этаж)",
                guests_min: 12,
                guests_max: 14,
                deposit: 8500,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/0d3bd633131447768cc975334ae44f00.jpg",
            },
            {
                id: 2148,
                name: "Банкетная рассадка (2 этаж)",
                guests_min: 24,
                guests_max: 50,
                deposit: 8500,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/a6406a916c704ae0992a96baf0ba5351.jpg",
            }

        ]
    },
    {
        restaurant_id: 10,
        options: []
    },
    {
        restaurant_id: 11,
        options: [{
            id: 2149,
            name: "Банкетная рассадка",
            guests_min: 8,
            guests_max: 11,
            deposit: 5000,
            deposit_message: null,
            service_fee: 10,
            image: "https://storage.yandexcloud.net/dreamteam-storage/3790ff7670bf4f1bb045cf2d37646bfa.jpg",
        },
            {
                id: 2150,
                name: "Банкетная рассадка",
                guests_min: 12,
                guests_max: 19,
                deposit: 10000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/14a57e50743c4cde8fe830afcf3ab938.jpg",
            },
            {
                id: 2151,
                name: "Банкетная рассадка",
                guests_min: 20,
                guests_max: 40,
                deposit: 15000,
                deposit_message: null,
                service_fee: 10,
                image: "https://storage.yandexcloud.net/dreamteam-storage/f187c97f96ab43f8be1c34ff3eefac78.JPG",
            }
        ]
    },
]

export const banquetParams: IBanquetParams  = {
    min_guests_number: 6,
    max_guests_number: 20,
    banquetType: ["День рождения", "Свадьба", "Важный повод", "Корпоратив", "Другое"],
    deposit_per_person: 4000,
    service_fee: 10,
}

export const banquetAdditionalOptions: IBanquetAdditionalOptions[] = [
    {
        restaurant_id: 1,
        options: ["Цветочное оформление",
            "Разработка персонального меню",
            "Винное сопровождение",
            "Торт по индивидуальному заказу"
        ]
    },
    {
        restaurant_id: 2,
        options: ["Цветочное оформление",
            "Разработка персонального меню",
            "Печать меню",
            "Фотограф"
        ]
    },
    {
        restaurant_id: 3,
        options: ["Цветочное оформление",
            "Дегустация пива с шеф-сомелье",
            "Пивное казино",
            "Торт по индивидуальному заказу",
            "Печать меню",
            "Приглашенный музыкант / группа",
            "Фотограф"

        ]
    },
    {
        restaurant_id: 4,
        options: []
    },
    {
        restaurant_id: 5,
        options: ["Разработка персонального меню",
            "Медиаоборудование (проектор / плазма)",]
    },
    {
        restaurant_id: 6,
        options: ["Цветочное оформление",
            "Разработка персонального меню",
            "Винное сопровождение",
        ]
    },
    {
        restaurant_id: 7,
        options: ["Разработка персонального меню",
            "Винное сопровождение",
            "Торт по индивидуальному заказу",
            "Печать меню",
            "Приглашенный музыкант / группа",
            "Ведущий",
            "Медиаоборудование (проектор / плазма)",
            "Фотограф"
        ]
    },
    {
        restaurant_id: 8,
        options: []
    },
    {
        restaurant_id: 9,
        options: ["Разработка персонального меню",
            "Винное сопровождение",
            "Приглашенный музыкант / группа",
            "Ведущий"
        ]
    },
    {
        restaurant_id: 10,
        options: []
    },
    {
        restaurant_id: 11,
        options: ["Цветочное оформление",
            "Разработка персонального меню",
            "Торт по индивидуальному заказу",
            "Медиаоборудование (проектор / плазма)",
            "Фотограф"
        ]
    },
]
