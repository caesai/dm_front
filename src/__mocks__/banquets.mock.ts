import { IBanquet, IBanquetAdditionalOptions, IBanquetOptions, IBanquetParams } from '@/types/banquets.ts';

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

export const banquetOptions: IBanquetOptions[] = [
    {
        id: 2136,
        name: "Кабинет",
        guests_limit: 14,
        deposit: "Без депозита",
        image_url: "https://moltomolto.ru/wp-content/uploads/2021/08/yubilej1.webp"
    },
    {
        id: 9823,
        name: "Винный зал",
        guests_limit: 16,
        conditions: "Индивидуальные условия",
        image_url: "https://ss.sport-express.ru/userfiles/materials/191/1913530/volga.jpg"
    },
    {
        id: 9827,
        name: `Граунд "ШИК"`,
        guests_limit: 14,
        conditions: "от 900 тыс. ₽",
        image_url: "https://i.pinimg.com/736x/42/64/e1/4264e1a3c56bbe061174039772d43fb0.jpg"
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
        name: "Индивидуальное оформление площадки",
        cost: 5000,
    },
    {
        name: "Разработка меню",
        cost: 10000,
    },
    {
        name: "Винное сопровождение",
        cost: 5000,
    },
    {
        name: "Торт по индивидуальному заказу",
        cost: 20000,
    },
    {
        name: "Ведущие",
        cost: 15000,
    },
    {
        name: "Музыкант/группа",
        cost: 40000,
    },
    {
        name: "Медиаоборудование",
        cost: 7000
    }
]