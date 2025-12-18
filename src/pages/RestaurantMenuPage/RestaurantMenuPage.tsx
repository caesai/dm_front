import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom';
import { IMenuItem } from '@/types/restaurant.types';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton';
import { BackIcon } from '@/components/Icons/BackIcon';
import css from './RestaurantMenuPage.module.css';

interface MenuCategory {
    id: string;
    name: string;
    items: IMenuItem[];
}

// Моковые данные для категорий (временно, пока нет API)
const MOCK_CATEGORIES: MenuCategory[] = [
    {
        id: 'special',
        name: 'Special Menu',
        items: [
            {
                id: 1,
                title: 'Крем - суп из пастернака',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/e7edc89403ac4da2ba4542683eae345a.jpg',
                price: 1300,
            },
            {
                id: 2,
                title: 'Пирог бефстроганов с копченой мозговой костью',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/3fd327138615467c881a33db39544c6b.jpg',
                price: 1300,
            },
            {
                id: 3,
                title: 'Крем - суп из пастернака',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/0325b515bb14493cae5dcd39aaab0812.jpg',
                price: 1300,
            },
            {
                id: 4,
                title: 'Пирог бефстроганов с копченой мозговой костью',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/f15a7c01a6a94329a292d64a0433109c.jpg',
                price: 1300,
            },
        ]
    },
    {
        id: 'gastronomy',
        name: 'Гастрономия',
        items: [
            {
                id: 5,
                title: 'Крем - суп из пастернака',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/e7edc89403ac4da2ba4542683eae345a.jpg',
                price: 1300,
            },
            {
                id: 6,
                title: 'Крем - суп из пастернака',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/3fd327138615467c881a33db39544c6b.jpg',
                price: 1300,
            },
            {
                id: 7,
                title: 'Пирог бефстроганов с копченой мозговой костью',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/0325b515bb14493cae5dcd39aaab0812.jpg',
                price: 1300,
            },
        ]
    },
    {
        id: 'salads',
        name: 'Салаты',
        items: [
            {
                id: 8,
                title: 'Греческий салат',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/e7edc89403ac4da2ba4542683eae345a.jpg',
                price: 890,
            },
            {
                id: 9,
                title: 'Цезарь с курицей',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/3fd327138615467c881a33db39544c6b.jpg',
                price: 990,
            },
        ]
    },
    {
        id: 'cocktails',
        name: 'Коктейли',
        items: [
            {
                id: 10,
                title: 'Вишневое наслаждение',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/e7edc89403ac4da2ba4542683eae345a.jpg',
                price: 1300,
            },
            {
                id: 11,
                title: 'Вишневое наслаждение',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/3fd327138615467c881a33db39544c6b.jpg',
                price: 1300,
            },
            {
                id: 12,
                title: 'Вишневое наслаждение',
                photo_url: 'https://storage.yandexcloud.net/dreamteam-storage/0325b515bb14493cae5dcd39aaab0812.jpg',
                price: 1300,
            },
        ]
    },
    {
        id: 'wine',
        name: 'Вино',
        items: []
    },
    {
        id: 'beer',
        name: 'Пиво',
        items: []
    },
    {
        id: 'drinks',
        name: 'Другие напитки',
        items: []
    },
];

interface WineItem {
    year: string;
    name: string;
    price: string;
}

interface WineCategory {
    title: string;
    items: WineItem[];
}

// Моковые данные для вина
const MOCK_WINE: WineCategory[] = [
    {
        title: 'Игристые вина / 125 мл',
        items: [
            { year: 'NV', name: 'Tete de Cheval Brut Pinskiy&Co / Kuban', price: '650 ₽' },
            { year: 'NV', name: 'Corvezzo Prosecco Treviso Extra Dry / Veneto', price: '1000 ₽' },
            { year: '2022', name: 'Calvet Cremant de Bordeauc Blanc de Noirs Brut / Bordeaux', price: '1100 ₽' },
            { year: 'NV', name: 'Andre Delorme Cremant de Bourgogne Rose Brut / Bourgogne', price: '1200 ₽' },
        ]
    },
    {
        title: 'Белые вина / 125 мл',
        items: [
            { year: '2023', name: 'San Matteo Pinot Grigio "Alla Moda" / Italy, Veneto', price: '850 ₽' },
            { year: '2019', name: 'Rem Akchurin-RBC Chardonnay Reserve / Russia, Crimea', price: '900 ₽' },
            { year: '2022', name: 'The Kauri Tree Sauvignon Blanc / New Zealand, Hawkes Bay', price: '950 ₽' },
            { year: '2022', name: 'The Kauri Tree Sauvignon Blanc / New Zealand, Hawkes Bay', price: '950 ₽' },
        ]
    },
    {
        title: 'Розовое вино / 125 мл',
        items: [
            { year: '2024', name: 'Alma Valley Розе "Невинность" / Russia, Crimea', price: '800 ₽' },
        ]
    },
    {
        title: 'Красные вина / 125 мл',
        items: [
            { year: '2024', name: 'Alma Valley Розе "Невинность" / Russia, Crimea', price: '800 ₽' },
            { year: '2024', name: 'Alma Valley Розе "Невинность" / Russia, Crimea', price: '800 ₽' },
            { year: '2024', name: 'Alma Valley Розе "Невинность" / Russia, Crimea', price: '800 ₽' },
        ]
    },
    {
        title: 'Безалкогольное вино / 750 мл',
        items: [
            { year: '', name: 'Vintae Grenache Blanc Le Naturel Zero Zero / Navarr', price: '6000 ₽' },
        ]
    },
    {
        title: 'Десертные вина / 40 мл',
        items: [
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
        ]
    },
];

// Моковые данные для пива
const MOCK_BEER: WineCategory[] = [
    {
        title: 'Игристые вина / 125 мл',
        items: [
            { year: 'NV', name: 'Tete de Cheval Brut Pinskiy&Co / Kuban', price: '650 ₽' },
            { year: 'NV', name: 'Corvezzo Prosecco Treviso Extra Dry / Veneto', price: '1000 ₽' },
            { year: '2022', name: 'Calvet Cremant de Bordeauc Blanc de Noirs Brut / Bordeaux', price: '1100 ₽' },
            { year: 'NV', name: 'Andre Delorme Cremant de Bourgogne Rose Brut / Bourgogne', price: '1200 ₽' },
        ]
    },
    {
        title: 'Десертные вина / 40 мл',
        items: [
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
            { year: '', name: 'Lheraud Ugni Blanc Pineau des Charentes / Cognac', price: '500 ₽' },
        ]
    },
];

// Моковые данные для других напитков
const MOCK_OTHER_DRINKS: WineCategory[] = [
    {
        title: 'Чай',
        items: [
            { year: '', name: 'Бергамот 300/500 мл', price: '800/1000 ₽' },
            { year: '', name: 'Бергамот 300/500 мл', price: '800/1000 ₽' },
            { year: '', name: 'Бергамот 300/500 мл', price: '800/1000 ₽' },
        ]
    },
    {
        title: 'Кофе',
        items: [
            { year: '', name: 'Латте 220/330/500 мл', price: '300/500/600 ₽' },
            { year: '', name: 'Латте 220/330/500 мл', price: '300/500/600 ₽' },
            { year: '', name: 'Латте 220/330/500 мл', price: '300/500/600 ₽' },
        ]
    },
];

export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedCategory, setSelectedCategory] = useState<string>('special');
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const restaurant = useMemo(() => {
        return restaurants.find(r => r.id === Number(id));
    }, [restaurants, id]);

    const handleBackClick = () => {
        navigate(`/restaurant/${id}`);
    };

    const scrollToCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            const yOffset = -140; // Отступ для sticky заголовка и вкладок
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Определяем, какая категория видна при скролле
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            
            for (const category of MOCK_CATEGORIES) {
                const element = categoryRefs.current[category.id];
                if (element) {
                    const { offsetTop } = element;
                    const offsetBottom = offsetTop + element.offsetHeight;
                    
                    if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                        setSelectedCategory(category.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!restaurant) {
        return (
            <div className={css.errorContainer}>
                <p>Ресторан не найден</p>
            </div>
        );
    }

    const handleDishClick = (dish: IMenuItem) => {
        navigate(`/restaurant/${id}/menu/dish/${dish.id}`, {
            state: { dish },
        });
    };

    // Рендер категории с карточками блюд
    const renderDishCategory = (category: MenuCategory) => (
        <div
            key={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className={css.categorySection}
        >
            <h2 className={css.categoryTitle}>{category.name}</h2>
            <div className={css.items}>
                {category.items.map((item) => (
                    <div 
                        key={item.id} 
                        className={css.menuItemWrapper}
                        onClick={() => handleDishClick(item)}
                    >
                        <div
                            className={css.menuItemImage}
                            style={{ backgroundImage: `url(${item.photo_url})` }}
                        />
                        <div className={css.menuItemInfo}>
                            <span className={css.menuItemTitle}>{item.title}</span>
                            <span className={css.menuItemWeight}>200 г</span>
                        </div>
                        <div className={css.menuItemPrice}>
                            <span className={css.priceText}>{item.price} ₽</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Рендер категории напитков (вино, пиво, другие напитки)
    const renderDrinkCategory = (categoryId: string, categoryName: string, data: WineCategory[]) => (
        <div
            key={categoryId}
            ref={(el) => (categoryRefs.current[categoryId] = el)}
            className={css.categorySection}
        >
            <h2 className={css.categoryTitle}>{categoryName}</h2>
            <div className={css.drinkSections}>
                {data.map((section, idx) => (
                    <div key={idx} className={css.drinkSection}>
                        <h3 className={css.drinkSectionTitle}>{section.title}</h3>
                        <div className={css.drinkItems}>
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className={css.drinkItem}>
                                    <div className={css.drinkInfo}>
                                        {item.year && <span className={css.drinkYear}>{item.year}</span>}
                                        <span className={css.drinkName}>{item.name}</span>
                                    </div>
                                    <span className={css.drinkPrice}>{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className={css.page}>
            {/* Заголовок */}
            <div className={css.header}>
                <RoundedButton
                    icon={<BackIcon />}
                    action={handleBackClick}
                />
                <h1 className={css.title}>{restaurant.title}</h1>
                <div className={css.spacer} />
            </div>

            {/* Вкладки категорий */}
            <div className={css.tabsContainer}>
                <div className={css.tabs}>
                    {MOCK_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            className={`${css.tab} ${selectedCategory === category.id ? css.tabActive : ''}`}
                            onClick={() => scrollToCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Контент категорий */}
            <div className={css.content}>
                {/* Special Menu */}
                {renderDishCategory(MOCK_CATEGORIES.find(c => c.id === 'special')!)}
                
                {/* Гастрономия */}
                {renderDishCategory(MOCK_CATEGORIES.find(c => c.id === 'gastronomy')!)}
                
                {/* Салаты */}
                {renderDishCategory(MOCK_CATEGORIES.find(c => c.id === 'salads')!)}
                
                {/* Коктейли */}
                {renderDishCategory(MOCK_CATEGORIES.find(c => c.id === 'cocktails')!)}
                
                {/* Вино */}
                {renderDrinkCategory('wine', 'Вино по бокалам', MOCK_WINE)}
                
                {/* Пиво */}
                {renderDrinkCategory('beer', 'Пиво', MOCK_BEER)}
                
                {/* Другие напитки */}
                {renderDrinkCategory('drinks', 'Другие напитки', MOCK_OTHER_DRINKS)}
            </div>
        </div>
    );
};
