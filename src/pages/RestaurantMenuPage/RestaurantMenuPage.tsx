/**
 * @fileoverview Страница меню ресторана.
 * 
 * Отображает полное меню выбранного ресторана с категориями и блюдами.
 * 
 * Основные функции:
 * - Отображение категорий меню с вкладками для навигации
 * - Поиск по меню с использованием trigram-алгоритма (нечёткий поиск)
 * - Два формата отображения: карточки (блюда с изображениями) и таблица (напитки)
 * - Возрастная верификация для категорий с алкоголем (коктейли)
 * - Сохранение и восстановление позиции скролла при навигации
 * - Блюр изображений коктейлей до подтверждения возраста (18+)
 * 
 * @module pages/RestaurantMenuPage
 * 
 * @see {@link useRestaurantMenu} - хук для загрузки данных меню
 * @see {@link trigramMatch} - функция нечёткого поиска
 * @see {@link AgeVerificationPopup} - попап верификации возраста
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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

/**
 * Страница меню ресторана.
 * 
 * @component
 * @returns {JSX.Element} Страница меню с категориями, поиском и возрастной верификацией
 * 
 * @example
 * // Роут в react-router
 * <Route path="/restaurant/:id/menu" element={<RestaurantMenuPage />} />
 */
export const RestaurantMenuPage: React.FC = (): JSX.Element => {
    // ============================================
    // Хуки навигации и роутинга
    // ============================================
    
    /** ID ресторана из URL параметров */
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // ============================================
    // Состояние компонента
    // ============================================
    
    /** Список ресторанов из атома */
    const [restaurants] = useAtom(restaurantsListAtom);
    /** ID выбранной категории для навигации по вкладкам */
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    /** Поисковый запрос */
    const [searchQuery, setSearchQuery] = useState<string>('');
    /** Флаг открытия попапа возрастной верификации */
    const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState<boolean>(false);
    /** Выбранный коктейль для перехода после верификации */
    const [, setSelectedCocktailItem] = useState<IAPIMenuItem | null>(null);
    
    /**
     * Флаг подтверждения возраста (18+).
     * Хранится в sessionStorage для сохранения при навигации,
     * но сбрасывается при перезагрузке страницы.
     */
    const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
        return sessionStorage.getItem('ageVerified') === 'true';
    });
    
    // ============================================
    // Рефы
    // ============================================
    
    /** Флаг показа попапа при возврате назад (предотвращает повторный показ) */
    const hasShownPopupOnReturnRef = useRef<boolean>(false);
    /** Рефы на DOM-элементы категорий для скролла */
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    /** Реф на контейнер вкладок */
    const tabsContainerRef = useRef<HTMLDivElement | null>(null);
    /** Рефы на кнопки вкладок */
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    /** Найденный ресторан по ID из URL */
    const restaurant = useMemo(() => {
        return restaurants.find((r) => r.id === String(id));
    }, [restaurants, id]);

    /** Данные меню, состояние загрузки и функция повторного запроса */
    const { menuData, loading, error, refetch } = useRestaurantMenu(String(id));

    /**
     * Список видимых категорий меню.
     * Фильтрует скрытые категории и категории без видимых блюд.
     */
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

    /** Ключевые слова для определения категорий коктейлей (требуют 18+) */
    const COCKTAIL_CATEGORY_KEYWORDS = ['коктейл', 'коктейли', 'cocktail', 'cocktails', 'замоканные'];

    /**
     * Проверяет, является ли категория категорией коктейлей.
     * Коктейли требуют возрастной верификации (18+).
     * 
     * @param categoryName - Название категории
     * @returns true если категория содержит ключевые слова коктейлей
     */
    const isCocktailCategory = (categoryName: string): boolean => {
        const name = categoryName.toLowerCase().trim();
        return COCKTAIL_CATEGORY_KEYWORDS.some((keyword) => name.includes(keyword));
    };

    // Восстановление позиции скролла при возврате назад
    useEffect(() => {
        const scrollKey = `menuScroll_${id}`;
        const savedScroll = sessionStorage.getItem(scrollKey);
        
        if (savedScroll && location.state?.fromDishDetails) {
            // Если вернулись со страницы деталей блюда, восстанавливаем скролл
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll, 10));
            }, 100);
            // Помечаем, что попап уже был показан (если был), чтобы не показывать снова
            hasShownPopupOnReturnRef.current = true;
        }
        
        // Сохраняем позицию скролла при скролле
        const handleScroll = () => {
            sessionStorage.setItem(scrollKey, window.scrollY.toString());
        };
        
        // Throttle для оптимизации
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', throttledScroll);
        };
    }, [id, location.state]);

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
                        
                        // Проверяем, является ли категория категорией коктейлей
                        const isCocktail = isCocktailCategory(category.name);
                        
                        // Если это категория коктейлей, пользователь не подтвердил возраст,
                        // попап еще не был показан при возврате назад, и мы долистали до этой категории
                        if (isCocktail && !isAgeVerified && !hasShownPopupOnReturnRef.current) {
                            // Открываем попап только если пользователь действительно долистал до категории
                            // (элемент виден на экране)
                            const elementRect = element.getBoundingClientRect();
                            const isVisible = elementRect.top < window.innerHeight && elementRect.bottom > 0;
                            
                            if (isVisible) {
                                setIsAgeVerificationOpen(true);
                                hasShownPopupOnReturnRef.current = true;
                            }
                        }
                        
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuData, searchQuery, isAgeVerified]);

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

    /** Обработчик клика "Назад" - навигация на страницу ресторана */
    const handleBackClick = () => {
        navigate(`/restaurant/${id}`);
    };

    /** Очистка поискового запроса */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * Скролл к выбранной категории.
     * Также проверяет, нужно ли показать попап возрастной верификации.
     * 
     * @param categoryId - ID категории для скролла
     */
    const scrollToCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            const yOffset = -201;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            // Проверяем, является ли категория категорией коктейлей
            const category = visibleCategories.find((cat) => cat.id === categoryId);
            if (category) {
                const isCocktail = isCocktailCategory(category.name);
                
                // Если это категория коктейлей, пользователь не подтвердил возраст,
                // и попап еще не был показан при возврате назад
                if (isCocktail && !isAgeVerified && !hasShownPopupOnReturnRef.current) {
                    // Небольшая задержка, чтобы скролл завершился
                    setTimeout(() => {
                        setIsAgeVerificationOpen(true);
                        hasShownPopupOnReturnRef.current = true;
                    }, 300);
                }
            }
        }
    };

    /**
     * Обработчик клика на блюдо.
     * Сохраняет позицию скролла и навигирует на страницу деталей блюда.
     * 
     * @param dish - Выбранное блюдо
     */
    const handleDishClick = (dish: IAPIMenuItem) => {
        // Сохраняем позицию скролла перед переходом
        const scrollKey = `menuScroll_${id}`;
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
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
            state: { dish: dishData, fromMenu: true },
        });
    };

    /**
     * Проверяет, является ли блюдо напитком (без изображения).
     * Напитки отображаются в табличном формате.
     * 
     * @param item - Блюдо для проверки
     * @returns true если у блюда нет изображения
     */
    const isDrinkItem = (item: IAPIMenuItem): boolean => {
        const defaultSize = getDefaultSize(item.item_sizes);
        return !defaultSize?.button_image_url || defaultSize.button_image_url.trim().length === 0;
    };

    /**
     * Определяет, должна ли категория отображаться в табличном формате.
     * Таблица используется для категорий, где все блюда - напитки (без изображений).
     * 
     * @param category - Категория для проверки
     * @returns true если все видимые блюда без изображений
     */
    const shouldRenderAsTable = (category: IAPIMenuCategory): boolean => {
        const visibleItems = category.menu_items.filter((item) => !item.is_hidden);
        return visibleItems.length > 0 && visibleItems.every((item) => isDrinkItem(item));
    };

    /**
     * Получает изображение для коктейля.
     * Используется изображение первого блюда с картинкой из меню,
     * так как у коктейлей обычно нет собственных изображений.
     * 
     * @returns URL изображения или пустая строка
     */
    const getCocktailImage = (): string => {
        return firstDishImage || '';
    };

    /**
     * Обработчик верификации возраста.
     * Сохраняет результат в sessionStorage.
     * 
     * @param verified - Подтверждён ли возраст (18+)
     */
    const handleVerifyAge = (verified: boolean) => {
        setIsAgeVerified(verified);
        // Сохраняем в sessionStorage, чтобы состояние сохранялось при навигации
        // но сбрасывалось при перезагрузке страницы
        if (verified) {
            sessionStorage.setItem('ageVerified', 'true');
        } else {
            sessionStorage.removeItem('ageVerified');
        }
        setIsAgeVerificationOpen(false);
        // После подтверждения возраста блюр снимается, но навигация не происходит автоматически
        // Пользователь должен кликнуть еще раз, чтобы перейти на детальную страницу
        setSelectedCocktailItem(null);
    };

    /**
     * Обработчик клика на коктейль.
     * Если возраст не подтверждён - открывает попап верификации.
     * Иначе - переходит на страницу деталей.
     * 
     * @param item - Выбранный коктейль
     */
    const handleCocktailClick = (item: IAPIMenuItem) => {
        if (!isAgeVerified) {
            setSelectedCocktailItem(item);
            setIsAgeVerificationOpen(true);
        } else {
            handleDishClick(item);
        }
    };

    /**
     * Рендерит категорию в формате карточек (блюда с изображениями).
     * 
     * @param category - Категория для рендеринга
     * @returns JSX элемент категории или null если нет видимых блюд
     */
    const renderDishCategory = (category: IAPIMenuCategory) => {
        let visibleItems = category.menu_items.filter((item) => !item.is_hidden);

        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter((item) => {
                const searchText = `${item.name} ${item.description || ''} ${item.guest_description || ''}`.toLowerCase();
                // Используем более строгий порог для более точного поиска
                // Порог 0.45 обеспечивает лучшее качество результатов
                return trigramMatch(searchText, searchQuery, 0.45);
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
                        
                        // Для коктейлей всегда считаем, что изображение есть (даже если firstDishImage пустое)
                        const hasImage = isCocktail ? (imageUrl && imageUrl.trim().length > 0) : (imageUrl && imageUrl.trim().length > 0);
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

    /**
     * Рендерит категорию в табличном формате (напитки без изображений).
     * 
     * @param category - Категория для рендеринга
     * @returns JSX элемент категории или null если нет видимых блюд
     */
    const renderDrinkCategory = (category: IAPIMenuCategory) => {
        let visibleItems = category.menu_items.filter((item) => !item.is_hidden);

        if (searchQuery.trim()) {
            visibleItems = visibleItems.filter((item) => {
                const searchText = `${item.name} ${item.description || ''} ${item.guest_description || ''}`.toLowerCase();
                // Используем более строгий порог для более точного поиска
                // Порог 0.45 обеспечивает лучшее качество результатов
                return trigramMatch(searchText, searchQuery, 0.45);
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
