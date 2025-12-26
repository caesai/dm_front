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
import { mapApiMenuItemToDishState } from '@/utils/menu.mapping';
// Hooks
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu';
// Components
import { AgeVerificationPopup } from '@/components/AgeVerificationPopup/AgeVerificationPopup';
// Styles
import menuErrorIcon from '/icons/menu-error.png';
import css from '@/pages/RestaurantMenuPage/RestaurantMenuPage.module.css';

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
 * - фильтрация блюд по `trigramMatch(searchText, searchQuery, 0.45)`
 * - `searchText` = `${item.name} ${item.description || ''} ${item.guest_description || ''}` в lower-case
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
 *   `['коктейл', 'коктейли', 'cocktail', 'cocktails', 'замоканные']` (case-insensitive)
 * - если пользователь НЕ подтвердил возраст:
 *   - изображение коктейля блюрится
 *   - клик по коктейлю НЕ ведёт на детальную страницу, вместо этого открывается `AgeVerificationPopup`
 * - подтверждение возраста сохраняется в `sessionStorage` под ключом `ageVerified=true`
 *   и применяется при навигации в пределах сессии вкладки (сброс при перезагрузке)
 * - попап открывается автоматически при:
 *   - скролле до категории коктейлей (если элемент виден на экране)
 *   - выборе категории коктейлей во вкладках
 * - попап НЕ показывается при возврате назад со страницы деталей блюда
 *
 * ### Навигация
 * - "назад" ведёт на `/restaurant/${id}`
 * - клик по блюду ведёт на `/restaurant/${id}/menu/dish/${dish.id}` и передаёт подготовленные данные блюда через `location.state`
 *
 * ### Сохранение позиции скролла
 * - позиция скролла сохраняется в `sessionStorage` под ключом `menuScroll_${id}` при скролле
 * - при возврате со страницы деталей блюда позиция скролла восстанавливается
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
 * - используется `window.scrollTo` для навигации по категориям
 */
export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState<boolean>(false);
    const [, setSelectedCocktailItem] = useState<IAPIMenuItem | null>(null);
    // Используем sessionStorage, чтобы состояние сохранялось при навигации, но сбрасывалось при перезагрузке страницы
    const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
        return sessionStorage.getItem('ageVerified') === 'true';
    });
    // Флаг для отслеживания, был ли показан попап при возврате назад
    const hasShownPopupOnReturnRef = useRef<boolean>(false);
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

    // Ключевые слова для определения категорий коктейлей
    const COCKTAIL_CATEGORY_KEYWORDS = ['коктейл', 'коктейли', 'cocktail', 'cocktails', 'замоканные'] as const;

    /**
     * Определяет, является ли категория категорией коктейлей
     * Категория коктейлей определяется по ключевым словам в названии (case-insensitive).
     * @param categoryName - Название категории
     * @returns true, если категория является категорией коктейлей
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

    /**
     * Обрабатывает клик по кнопке "Назад"
     * Навигирует на страницу ресторана.
     */
    const handleBackClick = () => {
        navigate(`/restaurant/${id}`);
    };

    /**
     * Очищает поисковый запрос
     * Используется при нажатии на кнопку "Перейти в меню" в состоянии "ничего не найдено".
     */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * Скроллит к указанной категории и обновляет активную вкладку
     * При скролле к категории коктейлей, если возраст не подтвержден, открывает попап проверки возраста.
     * @param categoryId - ID категории, к которой нужно скроллить
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
     * Обрабатывает клик по блюду
     * Подготавливает данные блюда (dishData) и навигирует на страницу деталей,
     * передавая данные через `location.state`. Сохраняет позицию скролла перед переходом.
     * @param dish - Элемент меню, по которому был клик
     */
    const handleDishClick = (dish: IAPIMenuItem) => {
        // Сохраняем позицию скролла перед переходом
        const scrollKey = `menuScroll_${id}`;
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
        
        // Используем утилиту для маппинга данных блюда
        const dishData = mapApiMenuItemToDishState(dish, menuData, getCocktailImage(), isCocktailCategory);

        navigate(`/restaurant/${id}/menu/dish/${dish.id}`, {
            state: { dish: dishData, fromMenu: true },
        });
    };

    /**
     * Определяет, является ли item "напитком" для табличного отображения
     * Напиток — это item, у которого на дефолтном размере отсутствует `button_image_url`.
     * @param item - Элемент меню для проверки
     * @returns true, если элемент является напитком (без изображения)
     */
    const isDrinkItem = (item: IAPIMenuItem): boolean => {
        const defaultSize = getDefaultSize(item.item_sizes);
        return !defaultSize?.button_image_url || defaultSize.button_image_url.trim().length === 0;
    };

    /**
     * Возвращает true, если категорию нужно рисовать таблицей
     * Категория отображается таблицей, если все видимые items являются "напитками" (isDrinkItem).
     * @param category - Категория меню для проверки
     * @returns true, если категорию нужно отображать в табличном формате
     */
    const shouldRenderAsTable = (category: IAPIMenuCategory): boolean => {
        const visibleItems = category.menu_items.filter((item) => !item.is_hidden);
        return visibleItems.length > 0 && visibleItems.every((item) => isDrinkItem(item));
    };

    /**
     * Получить изображение для коктейля
     * Возвращает изображение первого блюда с реальной картинкой из меню.
     * @returns URL изображения или пустая строка
     */
    const getCocktailImage = (): string => {
        return firstDishImage || '';
    };

    /**
     * Обрабатывает подтверждение возраста
     * Обновляет стейт, записывает/удаляет sessionStorage('ageVerified'), закрывает попап.
     * После подтверждения возраста блюр снимается, но навигация не происходит автоматически.
     * Пользователь должен кликнуть еще раз, чтобы перейти на детальную страницу.
     * @param verified - Результат проверки возраста (true - подтвержден, false - отклонен)
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
     * Обрабатывает клик по коктейлю
     * Если возраст не подтвержден, открывает попап проверки возраста.
     * Если возраст подтвержден, навигирует на детальную страницу.
     * @param item - Элемент меню (коктейль), по которому был клик
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
     * Рендерит категорию с блюдами в формате карточек
     * Отображает блюда в сетке 2 колонки с изображениями, названиями, весом и ценой.
     * Применяет блюр к изображениям коктейлей, если возраст не подтвержден.
     * @param category - Категория меню для отображения
     * @returns JSX элемент категории или null, если нет видимых блюд
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
     * Рендерит категорию с напитками в табличном формате
     * Отображает напитки в виде списка без изображений: объем, название, цена.
     * @param category - Категория меню для отображения
     * @returns JSX элемент категории или null, если нет видимых напитков
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
