import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// Types
import { IMenuCategory as IAPIMenuCategory, IMenuItem as IAPIMenuItem } from '@/types/menu.types.ts';
import { IMenuItem } from '@/types/restaurant.types.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Components
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
// Utils
import { extractPrice, getDefaultSize } from '@/utils/menu.utils';
import { trigramMatch } from '@/utils/trigram.utils';
// Hooks
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu';
// Components
import { AgeVerificationPopup } from '@/components/AgeVerificationPopup/AgeVerificationPopup';
// Styles
import menuErrorIcon from '/icons/menu-error.png';
import css from '@/pages/RestaurantMenuPage/RestaurantMenuPage.module.css';

// Константы для проверки возраста
const AGE_VERIFIED_STORAGE_KEY = 'ageVerified';

/**
 * Читает состояние проверки возраста из sessionStorage
 * @returns {boolean} true, если возраст был подтвержден
 */
const readAgeVerified = (): boolean => {
    return sessionStorage.getItem(AGE_VERIFIED_STORAGE_KEY) === 'true';
};

/**
 * Записывает состояние проверки возраста в sessionStorage
 * @param {boolean} verified - состояние проверки возраста
 */
const writeAgeVerified = (verified: boolean): void => {
    if (verified) {
        sessionStorage.setItem(AGE_VERIFIED_STORAGE_KEY, 'true');
    } else {
        sessionStorage.removeItem(AGE_VERIFIED_STORAGE_KEY);
    }
};

// Ключевые слова для определения категорий коктейлей
const COCKTAIL_CATEGORY_KEYWORDS = ['коктейл', 'коктейли', 'cocktail', 'cocktails'] as const;

/**
 * RestaurantMenuPage
 *
 * Страница меню ресторана.
 *
 * ### Источники данных
 * - `id` берётся из URL-параметра `useParams()` и используется:
 *   - для поиска ресторана в `restaurantsListAtom`
 *   - для загрузки меню через `useRestaurantMenu(Number(id))`
 *
 * ### Основные сценарии
 * 1. **Loading**
 *    - пока `useRestaurantMenu` возвращает `loading=true`, показывается заголовок и текст "Загрузка меню..."
 *
 * 2. **Error / Empty**
 *    - если `error === true` ИЛИ `menuData` отсутствует ИЛИ нет `item_categories`,
 *      показывается пустое состояние "Не удалось загрузить меню" и кнопка `Повторить попытку` (вызывает `refetch`)
 *
 * 3. **Success**
 *    - отображаются:
 *      - поисковая строка
 *      - вкладки категорий (если нет поиска)
 *      - список категорий с блюдами
 *
 * ### Правила видимости категорий и блюд
 * - `visibleCategories` = категории, у которых:
 *   - `!cat.is_hidden`
 *   - и есть хотя бы один `menu_item` с `!item.is_hidden`
 *
 * ### Поиск
 * - поиск работает по всем `visibleCategories`
 * - фильтрация блюд по `trigramMatch(searchText, searchQuery)`
 * - `searchText` = `${item.name} ${item.description || ''}` в lower-case
 * - если по запросу не найдено ни одного блюда, показывается состояние "По вашему запросу ничего не нашлось"
 *   и кнопка "Перейти в меню" очищает поиск
 *
 * ### Вкладки категорий и скролл-синхронизация
 * - при первой загрузке меню выбирается первая НЕ скрытая категория как `selectedCategory`
 * - при скролле (когда нет поиска) активная вкладка обновляется по положению секций на странице
 * - при выборе вкладки происходит `scrollToCategory`, скроллим к секции с offset -201px
 * - при смене активной вкладки вкладка горизонтально прокручивается в контейнере, чтобы была видима
 *
 * ### Отрисовка категорий
 * - если категория состоит только из "напитков" (у каждого item нет `button_image_url` на дефолтном размере),
 *   то категория рисуется "таблично" (`renderDrinkCategory`)
 * - иначе категория рисуется сеткой карточек (`renderDishCategory`)
 *
 * ### Особый случай: коктейли + проверка возраста
 * - категория считается коктейльной, если её название содержит ключевые слова:
 *   `['коктейл', 'коктейли', 'cocktail', 'cocktails']` (case-insensitive)
 * - если пользователь НЕ подтвердил возраст:
 *   - изображение коктейля блюрится
 *   - клик по коктейлю НЕ ведёт на детальную страницу, вместо этого открывается `AgeVerificationPopup`
 * - подтверждение возраста сохраняется в `sessionStorage` под ключом `ageVerified=true`
 *   и применяется при навигации в пределах сессии вкладки (сброс при перезагрузке)
 *
 * ### Навигация
 * - "назад" ведёт на `/restaurant/${id}`
 * - клик по блюду ведёт на `/restaurant/${id}/menu/dish/${dish.id}` и передаёт подготовленные данные блюда через `location.state`
 *
 * ### Подготовка данных блюда для детальной страницы
 * - берётся дефолтный размер `getDefaultSize(dish.item_sizes)`
 * - цена вычисляется через `extractPrice(defaultSize?.prices)`
 * - КБЖУ мапится из `nutrition_per_hundred` (с поддержкой альтернативных ключей: energy/protein/fat/carbs)
 * - allergens нормализуются в string[]
 * - weights = список `portion_weight_grams` для НЕ скрытых размеров
 * - для коктейлей:
 *   - `photo_url` подставляется из `firstDishImage` (первое блюдо с реальной картинкой в меню)
 *
 * ### Важные ограничения (для тестов)
 * - состояние возраста инициализируется из `sessionStorage` в `useState(() => ...)`
 * - внутри компонента есть `window.addEventListener('scroll', ...)` (нужно аккуратно мокать в тестах)
 */
export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState<boolean>(false);
    const [, setSelectedCocktailItem] = useState<IAPIMenuItem | null>(null);
    // Используем sessionStorage, чтобы состояние сохранялось при навигации, но сбрасывалось при перезагрузке страницы
    const [isAgeVerified, setIsAgeVerified] = useState<boolean>(readAgeVerified);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const tabsContainerRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const restaurant = useMemo(() => {
        return restaurants.find((r) => r.id === Number(id));
    }, [restaurants, id]);

    const { menuData, loading, error, refetch } = useRestaurantMenu(Number(id));

    const visibleCategories = useMemo(() => {
        if (!menuData) return [];
        return menuData.item_categories.filter(
            (cat) => !cat.is_hidden && cat.menu_items.some((item) => !item.is_hidden)
        );
    }, [menuData]);

    // Найти первое блюдо с изображением из меню для использования в коктейлях
    const firstDishImage = useMemo(() => {
        if (!menuData) return '';
        
        for (const category of menuData.item_categories) {
            if (category.is_hidden) continue;
            
            for (const item of category.menu_items) {
                if (item.is_hidden) continue;
                
                const defaultSize = getDefaultSize(item.item_sizes);
                const imageUrl = defaultSize?.button_image_url || '';
                
                if (imageUrl && imageUrl.trim().length > 0) {
                    return imageUrl;
                }
            }
        }
        
        return '';
    }, [menuData]);

    const searchResultsCount = useMemo(() => {
        if (!searchQuery.trim()) return 0;

        let count = 0;
        visibleCategories.forEach((category) => {
            const items = category.menu_items.filter((item) => {
                if (item.is_hidden) return false;
                const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
                return trigramMatch(searchText, searchQuery);
            });
            count += items.length;
        });
        return count;
    }, [searchQuery, visibleCategories]);

    const hasNoSearchResults = searchQuery.trim() && searchResultsCount === 0;

    useEffect(() => {
        if (menuData) {
            const firstVisibleCategory = menuData.item_categories?.find((cat) => !cat.is_hidden);
            if (firstVisibleCategory) {
                setSelectedCategory(firstVisibleCategory.id);
            }
        }
    }, [menuData]);

    useEffect(() => {
        if (!menuData || searchQuery) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 210;
            const visibleCategories = menuData.item_categories?.filter((cat) => !cat.is_hidden) || [];

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

    useEffect(() => {
        if (!selectedCategory || !tabsContainerRef.current || !tabRefs.current[selectedCategory]) return;

        const container = tabsContainerRef.current;
        const activeTab = tabRefs.current[selectedCategory];

        if (activeTab) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();

            const isVisible = tabRect.left >= containerRect.left && tabRect.right <= containerRect.right;

            if (!isVisible) {
                const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth',
                });
            }
        }
    }, [selectedCategory]);

    const handleBackClick = () => {
        navigate(`/restaurant/${id}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const scrollToCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            const yOffset = -201;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    /**
     * Обрабатывает клик по блюду
     * Подготавливает dishData и делает navigate на страницу деталей, передавая данные через `location.state`.
     * @param {IAPIMenuItem} dish - Блюдо, по которому был клик
     */
    const handleDishClick = (dish: IAPIMenuItem) => {
        const defaultSize = getDefaultSize(dish.item_sizes);
        const price = extractPrice(defaultSize?.prices);

        const nutrition = defaultSize?.nutrition_per_hundred;
        const calories = nutrition?.calories || nutrition?.energy || null;
        const proteins = nutrition?.proteins || nutrition?.protein || null;
        const fats = nutrition?.fats || nutrition?.fat || null;
        const carbohydrates = nutrition?.carbohydrates || nutrition?.carbs || null;

        const isCocktail = isCocktailCategory(
            menuData?.item_categories.find((cat) => cat.id === dish.category_id)?.name || ''
        );
        
        // Для коктейлей используем изображение первого блюда с картинкой из меню
        const cocktailImageUrl = isCocktail ? getCocktailImage() : '';
        const photoUrl = isCocktail && cocktailImageUrl ? cocktailImageUrl : (defaultSize?.button_image_url || '');

        const dishData: IMenuItem & {
            description?: string;
            composition?: string;
            calories?: number | null;
            proteins?: number | null;
            fats?: number | null;
            carbohydrates?: number | null;
            allergens?: string[];
            weights?: string[];
            weight_value?: string;
            item_sizes?: IAPIMenuItem['item_sizes'];
            isCocktail?: boolean;
        } = {
            id: parseInt(dish.id) || 0,
            title: dish.name,
            photo_url: photoUrl,
            price: price,
            // Используем поля из API напрямую, без fallback
            // Если есть guest_description - используем его, иначе description (если есть)
            description: dish.guest_description || (dish.description ? dish.description : undefined),
            // Используем composition из API (если есть)
            composition: dish.composition,
            calories,
            proteins,
            fats,
            carbohydrates,
            allergens: dish.allergens
                ?.map((a) => {
                    if (typeof a === 'string') return a;
                    if (a && typeof a === 'object') {
                        return (
                            a.name ||
                            a.title ||
                            a.value ||
                            Object.values(a).find((v) => typeof v === 'string' && v.length > 0 && !/^[A-Z]\d+$/.test(v))
                        );
                    }
                    return null;
                })
                .filter(Boolean) as string[],
            weights: dish.item_sizes.filter((s) => !s.is_hidden).map((s) => s.portion_weight_grams.toString()),
            weight_value: dish.measure_unit || defaultSize?.measure_unit_type || '',
            item_sizes: dish.item_sizes.filter((s) => !s.is_hidden),
            isCocktail: isCocktail,
        };

        navigate(`/restaurant/${id}/menu/dish/${dish.id}`, {
            state: { dish: dishData },
        });
    };

    /**
     * Определяет, является ли item "напитком" для табличного отображения
     * Напиток — это item, у которого на дефолтном размере отсутствует `button_image_url`.
     * @param {IAPIMenuItem} item - Элемент меню для проверки
     * @returns {boolean} true, если item является напитком
     */
    const isDrinkItem = (item: IAPIMenuItem): boolean => {
        const defaultSize = getDefaultSize(item.item_sizes);
        return !defaultSize?.button_image_url || defaultSize.button_image_url.trim().length === 0;
    };

    /**
     * Возвращает true, если категорию нужно рисовать таблицей
     * Категория рисуется таблицей, если:
     * - есть хотя бы 1 видимый item
     * - и все видимые items считаются "напитками" (isDrinkItem)
     * @param {IAPIMenuCategory} category - Категория меню для проверки
     * @returns {boolean} true, если категория должна отображаться как таблица
     */
    const shouldRenderAsTable = (category: IAPIMenuCategory): boolean => {
        const visibleItems = category.menu_items.filter((item) => !item.is_hidden);
        return visibleItems.length > 0 && visibleItems.every((item) => isDrinkItem(item));
    };

    /**
     * Проверка, является ли категория категорией коктейлей
     * Категория коктейлей определяется по ключевым словам в названии (case-insensitive).
     * @param {string} categoryName - Название категории
     * @returns {boolean} true, если категория является категорией коктейлей
     */
    const isCocktailCategory = (categoryName: string): boolean => {
        const name = categoryName.toLowerCase().trim();
        return COCKTAIL_CATEGORY_KEYWORDS.some((keyword) => name.includes(keyword));
    };

    /**
     * Получить изображение для коктейля
     * Возвращает изображение первого блюда с реальной картинкой из меню.
     * @returns {string} URL изображения или пустая строка
     */
    const getCocktailImage = (): string => {
        return firstDishImage || '';
    };

    /**
     * Обрабатывает подтверждение возраста
     * Обновляет стейт, записывает/удаляет sessionStorage('ageVerified'), закрывает попап.
     * После подтверждения возраста блюр снимается, но навигация не происходит автоматически.
     * Пользователь должен кликнуть еще раз, чтобы перейти на детальную страницу.
     * @param {boolean} verified - Результат проверки возраста
     */
    const handleVerifyAge = (verified: boolean) => {
        setIsAgeVerified(verified);
        writeAgeVerified(verified);
        setIsAgeVerificationOpen(false);
        setSelectedCocktailItem(null);
    };

    const handleCocktailClick = (item: IAPIMenuItem) => {
        if (!isAgeVerified) {
            setSelectedCocktailItem(item);
            setIsAgeVerificationOpen(true);
        } else {
            handleDishClick(item);
        }
    };

    const renderDishCategory = (category: IAPIMenuCategory) => {
        let visibleItems = category.menu_items.filter((item) => !item.is_hidden);

        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter((item) => {
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
                        const defaultSize = getDefaultSize(item.item_sizes);
                        const isCocktail = isCocktailCategory(category.name);
                        const shouldBlur = isCocktail && !isAgeVerified;
                        
                        // Для коктейлей используем изображение первого блюда с картинкой из меню
                        let imageUrl = '';
                        if (isCocktail) {
                            imageUrl = getCocktailImage();
                        } else {
                            imageUrl = defaultSize?.button_image_url || '';
                        }
                        
                        // Проверяем наличие изображения
                        const hasImage = Boolean(imageUrl?.trim());
                        const portionWeight = defaultSize?.portion_weight_grams;
                        const measureUnit = item.measure_unit || defaultSize?.measure_unit_type || '';
                        const weight = portionWeight ? `${portionWeight} ${measureUnit}` : '';
                        const price = extractPrice(defaultSize?.prices);

                        return (
                            <div 
                                key={item.id} 
                                className={css.menuItemWrapper} 
                                onClick={() => isCocktail ? handleCocktailClick(item) : handleDishClick(item)}
                            >
                                <div
                                    className={`${css.menuItemImage} ${shouldBlur ? css.blurredImage : ''}`}
                                    style={{
                                        backgroundImage: hasImage ? `url(${imageUrl})` : 'none',
                                        backgroundColor: hasImage ? 'transparent' : '#FFFFFF',
                                        border: hasImage ? 'none' : '1px solid #E9E9E9',
                                        borderRadius: '12px',
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

    const renderDrinkCategory = (category: IAPIMenuCategory) => {
        let visibleItems = category.menu_items.filter((item) => !item.is_hidden);

        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter((item) => {
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
                <div className={css.drinkSections}>
                    <div className={css.drinkItems}>
                        {visibleItems.map((item) => {
                            const defaultSize = getDefaultSize(item.item_sizes);
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

    if (loading) {
        return (
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton icon={<BackIcon />} action={handleBackClick} />
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
                    <RoundedButton icon={<BackIcon />} action={handleBackClick} />
                    <h1 className={css.title}>{restaurant.title}</h1>
                    <div className={css.spacer} />
                </div>
                <div className={css.emptyStateContainer}>
                    <img src={menuErrorIcon} alt="Ошибка загрузки меню" className={css.emptyStateIcon} />
                    <p className={css.emptyStateText}>Не удалось загрузить меню</p>
                    <button className={css.emptyStateButton} onClick={refetch}>
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={css.page}>
            <div className={css.header}>
                <RoundedButton icon={<BackIcon />} action={handleBackClick} />
                <h1 className={css.title}>{restaurant.title}</h1>
                <div className={css.spacer} />
            </div>

            <div className={css.searchContainer}>
                <div className={css.searchInput}>
                    <svg
                        className={css.searchIcon}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                            stroke="#545454"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M21 21L16.65 16.65"
                            stroke="#545454"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        className={css.searchField}
                        placeholder="Поиск по меню"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={css.clearButton} onClick={() => setSearchQuery('')}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

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

            {hasNoSearchResults ? (
                <div className={css.emptyStateContainer}>
                    <img src={menuErrorIcon} alt="Ничего не найдено" className={css.emptyStateIcon} />
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
            
            <AgeVerificationPopup
                isOpen={isAgeVerificationOpen}
                onConfirm={() => handleVerifyAge(true)}
                onCancel={() => handleVerifyAge(false)}
            />
        </div>
    );
};
