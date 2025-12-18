import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom';
import { authAtom } from '@/atoms/userAtom';
import { restaurantMenusAtom } from '@/atoms/restaurantMenuAtom';
import { IMenuItem } from '@/types/restaurant.types';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton';
import { BackIcon } from '@/components/Icons/BackIcon';
import { 
    APIGetRestaurantMenu, 
    IMenu, 
    IMenuCategory as IAPIMenuCategory,
    IMenuItem as IAPIMenuItem 
} from '@/api/menu.api';
import css from './RestaurantMenuPage.module.css';

export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurants] = useAtom(restaurantsListAtom);
    const [auth] = useAtom(authAtom);
    const [restaurantMenus, setRestaurantMenus] = useAtom(restaurantMenusAtom);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [menuData, setMenuData] = useState<IMenu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const restaurant = useMemo(() => {
        return restaurants.find(r => r.id === Number(id));
    }, [restaurants, id]);

    // Загрузка меню из кеша или API
    useEffect(() => {
        if (!auth?.access_token || !id) return;

        const restaurantId = Number(id);
        
        // Проверяем кеш
        if (restaurantMenus[restaurantId]) {
            console.log('[RestaurantMenuPage] Меню загружено из кеша');
            setMenuData(restaurantMenus[restaurantId]);
            
            const firstVisibleCategory = restaurantMenus[restaurantId].item_categories?.find(cat => !cat.is_hidden);
            if (firstVisibleCategory) {
                setSelectedCategory(firstVisibleCategory.id);
            }
            setLoading(false);
            return;
        }

        // Загружаем из API
        console.log('[RestaurantMenuPage] Загрузка меню из API...');
        setLoading(true);
        APIGetRestaurantMenu(auth.access_token, restaurantId)
            .then((response) => {
                const menu = response.data[0];
                setMenuData(menu);
                
                // Сохраняем в кеш
                setRestaurantMenus(prev => ({
                    ...prev,
                    [restaurantId]: menu
                }));
                
                const firstVisibleCategory = menu?.item_categories?.find(cat => !cat.is_hidden);
                if (firstVisibleCategory) {
                    setSelectedCategory(firstVisibleCategory.id);
                }
            })
            .catch((error) => {
                console.error('[RestaurantMenuPage] Ошибка загрузки меню:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [auth?.access_token, id, restaurantMenus, setRestaurantMenus]);

    // Обновление видимой категории при скролле
    useEffect(() => {
        if (!menuData) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            const visibleCategories = menuData.item_categories?.filter(cat => !cat.is_hidden) || [];
            
            for (const category of visibleCategories) {
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
    }, [menuData]);

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

    // Функция для извлечения цены из prices массива
    const extractPrice = (prices: any[] | undefined): number => {
        if (!prices || prices.length === 0) return 0;
        
        // Ищем цену с типом "default" или берем первую
        const defaultPrice = prices.find(p => p.price_list_id === 'default') || prices[0];
        return defaultPrice?.value || 0;
    };

    const handleDishClick = (dish: IAPIMenuItem) => {
        // Преобразуем данные из API в формат для детальной страницы
        const defaultSize = dish.item_sizes.find(s => s.is_default) || dish.item_sizes[0];
        const price = extractPrice(defaultSize?.prices);
        
        // Извлекаем КБЖУ из nutrition_per_hundred первого размера
        const nutrition = defaultSize?.nutrition_per_hundred;
        const calories = nutrition?.calories || nutrition?.energy || null;
        const proteins = nutrition?.proteins || nutrition?.protein || null;
        const fats = nutrition?.fats || nutrition?.fat || null;
        const carbohydrates = nutrition?.carbohydrates || nutrition?.carbs || null;
        
        const dishData: IMenuItem & {
            description?: string;
            calories?: number | null;
            proteins?: number | null;
            fats?: number | null;
            carbohydrates?: number | null;
            allergens?: string[];
            weights?: string[];
            weight_value?: string;
            item_sizes?: IAPIMenuItem['item_sizes'];
        } = {
            id: parseInt(dish.id) || 0,
            title: dish.name,
            photo_url: defaultSize?.button_image_url || '',
            price: price,
            description: dish.description,
            calories,
            proteins,
            fats,
            carbohydrates,
            allergens: dish.allergens
                ?.map(a => {
                    // Извлекаем только название аллергена без кода (A1, B3 и т.д.)
                    if (typeof a === 'string') return a;
                    if (a && typeof a === 'object') {
                        // Ищем поле name/title/value, игнорируя code
                        return a.name || a.title || a.value || Object.values(a).find(v => 
                            typeof v === 'string' && v.length > 0 && !/^[A-Z]\d+$/.test(v)
                        );
                    }
                    return null;
                })
                .filter(Boolean) as string[],
            weights: dish.item_sizes
                .filter(s => !s.is_hidden)
                .map(s => s.portion_weight_grams.toString()),
            weight_value: dish.measure_unit,
            item_sizes: dish.item_sizes.filter(s => !s.is_hidden), // Передаем все размеры для выбора
        };

        navigate(`/restaurant/${id}/menu/dish/${dish.id}`, {
            state: { dish: dishData },
        });
    };

    // Определяем, является ли категория напитками (должна отображаться таблицей)
    const isDrinkCategory = (categoryName: string): boolean => {
        const drinkKeywords = ['вино', 'пиво', 'напитки', 'коктейл'];
        return drinkKeywords.some(keyword => categoryName.toLowerCase().includes(keyword));
    };

    // Рендер категории с карточками блюд из API (2 колонки с фото)
    const renderDishCategory = (category: IAPIMenuCategory) => {
        const visibleItems = category.menu_items.filter(item => !item.is_hidden);
        
        if (visibleItems.length === 0) return null;

        return (
            <div
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
                className={css.categorySection}
            >
                <h2 className={css.categoryTitle}>{category.name}</h2>
                <div className={css.items}>
                    {visibleItems.map((item) => {
                        const defaultSize = item.item_sizes.find(s => s.is_default) || item.item_sizes[0];
                        const imageUrl = defaultSize?.button_image_url || '';
                        const portionWeight = defaultSize?.portion_weight_grams;
                        const weight = portionWeight ? `${portionWeight} ${item.measure_unit}` : '';
                        const price = extractPrice(defaultSize?.prices);

                        return (
                            <div 
                                key={item.id} 
                                className={css.menuItemWrapper}
                                onClick={() => handleDishClick(item)}
                            >
                                <div
                                    className={css.menuItemImage}
                                    style={{ 
                                        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                                        backgroundColor: imageUrl ? 'transparent' : '#F4F4F4'
                                    }}
                                />
                                <div className={css.menuItemContent}>
                                    <div className={css.menuItemInfo}>
                                        <span className={css.menuItemTitle}>{item.name}</span>
                                        {weight && <span className={css.menuItemWeight}>{weight}</span>}
                                    </div>
                                    <div className={css.menuItemPrice}>
                                        {price > 0 && <span className={css.priceText}>{price} ₽</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Рендер категории напитков в виде таблицы
    const renderDrinkCategory = (category: IAPIMenuCategory) => {
        const visibleItems = category.menu_items.filter(item => !item.is_hidden);
        
        if (visibleItems.length === 0) return null;

        // Группируем по типам (если есть теги или описание)
        // Пока просто рендерим все в одном списке
        return (
            <div
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
                className={css.categorySection}
            >
                <h2 className={css.categoryTitle}>{category.name}</h2>
                <div className={css.drinkSections}>
                    <div className={css.drinkItems}>
                        {visibleItems.map((item) => {
                            const defaultSize = item.item_sizes.find(s => s.is_default) || item.item_sizes[0];
                            const portionWeight = defaultSize?.portion_weight_grams;
                            const volume = portionWeight ? `${portionWeight} ${item.measure_unit}` : '';
                            const price = extractPrice(defaultSize?.prices);

                            return (
                                <div key={item.id} className={css.drinkItem}>
                                    <div className={css.drinkInfo}>
                                        {volume && <span className={css.drinkVolume}>{volume}</span>}
                                        <span className={css.drinkName}>{item.name}</span>
                                    </div>
                                    {price > 0 && <span className={css.drinkPrice}>{price} ₽</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    if (!restaurant) {
        return (
            <div className={css.errorContainer}>
                <p>Ресторан не найден</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon />}
                        action={handleBackClick}
                    />
                    <h1 className={css.title}>{restaurant.title}</h1>
                    <div className={css.spacer} />
                </div>
                <div className={css.loadingContainer}>
                    <p>Загрузка меню...</p>
                </div>
            </div>
        );
    }

    if (!menuData || !menuData.item_categories || menuData.item_categories.length === 0) {
        return (
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon />}
                        action={handleBackClick}
                    />
                    <h1 className={css.title}>{restaurant.title}</h1>
                    <div className={css.spacer} />
                </div>
                <div className={css.errorContainer}>
                    <p>Меню временно недоступно</p>
                </div>
            </div>
        );
    }

    // Фильтруем скрытые категории
    const visibleCategories = menuData.item_categories.filter(cat => !cat.is_hidden);

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
                    {visibleCategories.map((category) => (
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
                {visibleCategories.map((category) => {
                    // Определяем, должна ли категория отображаться как таблица или как карточки
                    if (isDrinkCategory(category.name)) {
                        return renderDrinkCategory(category);
                    }
                    return renderDishCategory(category);
                })}
            </div>
        </div>
    );
};
