import { IBanquet, IBanquetAdditionalOptions, IBanquetOptions, IBanquetParams } from '@/types/banquets.ts';

export const banquetData: IBanquet = {
    image_url: "https://kolmelhior.ru/upload/iblock/2c4/1tzhih52e9d6exo286ecgqqsi8l0mmr9.jpg",
    description: "Мы создадим идеальные условия для вашего праздника: вкусное меню, комфортный зал и душевная атмосфера."
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