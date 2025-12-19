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
import { extractPrice } from '@/utils/menu.utils';
import { trigramMatch } from '@/utils/trigram.utils';
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
    const [error, setError] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const tabsContainerRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
                setError(true);
                setLoading(false);
            })
            .finally(() => {
                if (!error) {
                    setLoading(false);
                }
            });
    }, [auth?.access_token, id, restaurantMenus, setRestaurantMenus]);

    // Обновление видимой категории при скролле
    useEffect(() => {
        if (!menuData || searchQuery) return; // Не обновляем категорию при активном поиске

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 210; // Смещение: header + search + tabs
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
    }, [menuData, searchQuery]);

    // Автоскролл активной категории в блоке tabs
    useEffect(() => {
        if (!selectedCategory || !tabsContainerRef.current || !tabRefs.current[selectedCategory]) return;

        const container = tabsContainerRef.current;
        const activeTab = tabRefs.current[selectedCategory];

        if (activeTab) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();

            // Проверяем, виден ли элемент в контейнере
            const isVisible = 
                tabRect.left >= containerRect.left &&
                tabRect.right <= containerRect.right;

            if (!isVisible) {
                // Прокручиваем контейнер так, чтобы активная кнопка была в центре
                const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedCategory]);

    const handleBackClick = () => {
        navigate(`/restaurant/${id}`);
    };

    const scrollToCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            // Отступ: header (84px) + search (61px) + tabsContainer (56px) = 201px
            const yOffset = -201;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
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
            weight_value: dish.measure_unit || defaultSize?.measure_unit_type || '',
            item_sizes: dish.item_sizes.filter(s => !s.is_hidden), // Передаем все размеры для выбора
        };

        navigate(`/restaurant/${id}/menu/dish/${dish.id}`, {
            state: { dish: dishData },
        });
    };

    // Определяем, является ли блюдо напитком (нет изображения)
    const isDrinkItem = (item: IAPIMenuItem): boolean => {
        const defaultSize = item.item_sizes.find(s => s.is_default) || item.item_sizes[0];
        const hasImage = defaultSize?.button_image_url && defaultSize.button_image_url.trim().length > 0;
        
        // Напиток = нет изображения
        return !hasImage;
    };
    
    // Определяем, нужно ли отображать категорию как таблицу (все видимые блюда - напитки)
    const shouldRenderAsTable = (category: IAPIMenuCategory): boolean => {
        const visibleItems = category.menu_items.filter(item => !item.is_hidden);
        
        if (visibleItems.length === 0) return false;
        
        // Если все видимые блюда - напитки, показываем таблицей
        return visibleItems.every(item => isDrinkItem(item));
    };

    // Рендер категории с карточками блюд из API (2 колонки с фото)
    const renderDishCategory = (category: IAPIMenuCategory) => {
        let visibleItems = category.menu_items.filter(item => !item.is_hidden);
        
        // Фильтрация по поисковому запросу
        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter(item => {
                const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
                return trigramMatch(searchText, searchQuery);
            });
        }
        
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
                        const hasImage = imageUrl && imageUrl.trim().length > 0;
                        const portionWeight = defaultSize?.portion_weight_grams;
                        // Нормализуем единицу измерения
                        const measureUnit = item.measure_unit || defaultSize?.measure_unit_type || '';
                        const weight = portionWeight ? `${portionWeight} ${measureUnit}` : '';
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
                                        backgroundImage: hasImage ? `url(${imageUrl})` : 'none',
                                        backgroundColor: hasImage ? 'transparent' : '#FFFFFF',
                                        border: hasImage ? 'none' : '1px solid #E9E9E9'
                                    }}
                                />
                                <div className={css.menuItemContent}>
                                    <div className={css.menuItemInfo}>
                                        <span className={css.menuItemTitle}>{item.name}</span>
                                        {weight && <span className={css.menuItemWeight}>{weight}</span>}
                                    </div>
                                    <div className={css.menuItemPrice}>
                                        <span className={css.priceText}>{price > 0 ? `${price} ₽` : ''}</span>
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
        let visibleItems = category.menu_items.filter(item => !item.is_hidden);
        
        // Фильтрация по поисковому запросу
        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter(item => {
                const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
                return trigramMatch(searchText, searchQuery);
            });
        }
        
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
                            const measureUnit = item.measure_unit || defaultSize?.measure_unit_type || '';
                            const volume = portionWeight ? `${portionWeight} ${measureUnit}` : '';
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

    const handleRetry = () => {
        setError(false);
        setLoading(true);
        window.location.reload();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

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

    if (error || !menuData || !menuData.item_categories || menuData.item_categories.length === 0) {
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
                <div className={css.emptyStateContainer}>
                    <svg className={css.emptyStateIcon} width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="48" cy="48" r="44.5" stroke="#A6A6A6" strokeWidth="7"/>
                        <path d="M66 48C66 57.9411 58.9411 66 49 66C39.0589 66 32 57.9411 32 48C32 38.0589 39.0589 31 49 31C58.9411 31 66 38.0589 66 48Z" stroke="#A6A6A6" strokeWidth="7"/>
                        <rect x="72" y="72" width="4" height="12" transform="rotate(45 72 72)" fill="#A6A6A6"/>
                        <circle cx="48" cy="40" r="12" fill="#F4F4F4"/>
                    </svg>
                    <p className={css.emptyStateText}>Не удалось загрузить меню</p>
                    <button className={css.emptyStateButton} onClick={handleRetry}>
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }

    // Функция для проверки, есть ли в категории видимые блюда
    const categoryHasItems = (category: IAPIMenuCategory): boolean => {
        return category.menu_items.some(item => !item.is_hidden);
    };

    // Фильтруем скрытые категории и категории без блюд
    const visibleCategories = menuData.item_categories.filter(cat => 
        !cat.is_hidden && categoryHasItems(cat)
    );

    // Подсчитываем количество результатов поиска
    const getSearchResultsCount = () => {
        if (!searchQuery.trim()) return 0;
        
        let count = 0;
        visibleCategories.forEach(category => {
            const items = category.menu_items.filter(item => {
                if (item.is_hidden) return false;
                const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
                return trigramMatch(searchText, searchQuery);
            });
            count += items.length;
        });
        return count;
    };

    const searchResultsCount = searchQuery.trim() ? getSearchResultsCount() : 0;
    const hasNoSearchResults = searchQuery.trim() && searchResultsCount === 0;

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

            {/* Поисковая строка */}
            <div className={css.searchContainer}>
                <div className={css.searchInput}>
                    <svg className={css.searchIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#545454" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#545454" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                        type="text"
                        className={css.searchField}
                        placeholder="Поиск по меню"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            className={css.clearButton}
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Вкладки категорий */}
            {!searchQuery && (
                <div className={css.tabsContainer}>
                <div className={css.tabs} ref={tabsContainerRef}>
                    {visibleCategories.map((category) => (
                        <button
                            key={category.id}
                            ref={(el) => (tabRefs.current[category.id] = el)}
                            className={`${css.tab} ${selectedCategory === category.id ? css.tabActive : ''}`}
                            onClick={() => scrollToCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            )}

            {/* Контент категорий или пустое состояние */}
            {hasNoSearchResults ? (
                <div className={css.emptyStateContainer}>
                    <svg className={css.emptyStateIcon} width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="48" cy="48" r="44.5" stroke="#A6A6A6" strokeWidth="7"/>
                        <path d="M66 48C66 57.9411 58.9411 66 49 66C39.0589 66 32 57.9411 32 48C32 38.0589 39.0589 31 49 31C58.9411 31 66 38.0589 66 48Z" stroke="#A6A6A6" strokeWidth="7"/>
                        <rect x="72" y="72" width="4" height="12" transform="rotate(45 72 72)" fill="#A6A6A6"/>
                        <circle cx="48" cy="40" r="12" fill="#F4F4F4"/>
                    </svg>
                    <p className={css.emptyStateText}>По вашему запросу ничего не нашлось</p>
                    <button className={css.emptyStateButton} onClick={handleClearSearch}>
                        Перейти в меню
                    </button>
                </div>
            ) : (
                <div className={css.content}>
                    {visibleCategories.map((category) => {
                        // Определяем, должна ли категория отображаться как таблица (все блюда - напитки)
                        if (shouldRenderAsTable(category)) {
                            return renderDrinkCategory(category);
                        }
                        return renderDishCategory(category);
                    })}
                </div>
            )}
        </div>
    );
};
