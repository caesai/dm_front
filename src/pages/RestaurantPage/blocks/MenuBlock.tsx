import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { IMenuImg } from '@/types/restaurant.types.ts';
import { authAtom } from '@/atoms/userAtom.ts';
import { restaurantMenusAtom } from '@/atoms/restaurantMenuAtom.ts';
import { APIGetRestaurantMenu, IMenuItem as IAPIMenuItem } from '@/api/menu.api.ts';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { MenuPopup } from '@/components/MenuPopup/MenuPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface MenuBlockProps {
    menu_imgs: IMenuImg[] | undefined;
    restaurant_id: number;
}

export const MenuBlock: React.FC<MenuBlockProps> = ({ menu_imgs, restaurant_id }) => {
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    const [restaurantMenus, setRestaurantMenus] = useAtom(restaurantMenusAtom);
    const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
    const [menuItems, setMenuItems] = useState<IAPIMenuItem[]>([]);

    // Функция для извлечения цены из prices массива
    const extractPriceForFilter = (prices: any[] | undefined): number => {
        if (!prices || prices.length === 0) return 0;
        
        const priceObj = prices[0];
        if (!priceObj || typeof priceObj !== 'object') return 0;
        
        const keys = Object.keys(priceObj);
        if (keys.length === 0) return 0;
        
        const firstKey = keys[0];
        const priceData = priceObj[firstKey];
        
        if (typeof priceData === 'number') return priceData;
        
        if (typeof priceData === 'object' && priceData !== null) {
            return priceData.value || priceData.price || priceData.amount || 0;
        }
        
        return 0;
    };

    // Загрузка меню из кеша или API
    useEffect(() => {
        if (!auth?.access_token || !restaurant_id) return;

        // Проверяем кеш
        if (restaurantMenus[restaurant_id]) {
            console.log('[MenuBlock] Меню загружено из кеша');
            const menu = restaurantMenus[restaurant_id];
            const allItems = menu.item_categories
                .filter(cat => !cat.is_hidden)
                .flatMap(cat => cat.menu_items.filter(item => !item.is_hidden))
                .slice(0, 10); // Берем первые 10 блюд
            setMenuItems(allItems);
            return;
        }

        // Загружаем из API
        console.log('[MenuBlock] Загрузка меню из API...');
        APIGetRestaurantMenu(auth.access_token, restaurant_id)
            .then((response) => {
                const menu = response.data[0];
                
                // Сохраняем в кеш
                setRestaurantMenus(prev => ({
                    ...prev,
                    [restaurant_id]: menu
                }));
                
                const allItems = menu.item_categories
                    .filter(cat => !cat.is_hidden)
                    .flatMap(cat => cat.menu_items.filter(item => !item.is_hidden))
                    .slice(0, 10); // Берем первые 10 блюд
                setMenuItems(allItems);
            })
            .catch((error) => {
                console.error('[MenuBlock] Ошибка загрузки меню:', error);
            });
    }, [auth?.access_token, restaurant_id, restaurantMenus, setRestaurantMenus]);

    // Функция для извлечения цены из prices массива
    const extractPrice = (prices: any[] | undefined): number => {
        if (!prices || prices.length === 0) return 0;
        
        // Берем первый элемент массива prices
        const priceObj = prices[0];
        if (!priceObj || typeof priceObj !== 'object') return 0;
        
        // Извлекаем значение цены из первого свойства объекта
        // Структура: [{ "additionalProp1": {} }] или [{ "default": { "value": 1000 } }]
        const keys = Object.keys(priceObj);
        if (keys.length === 0) return 0;
        
        const firstKey = keys[0];
        const priceData = priceObj[firstKey];
        
        // Если priceData - число, возвращаем его
        if (typeof priceData === 'number') return priceData;
        
        // Если priceData - объект, ищем поле value, price, amount
        if (typeof priceData === 'object' && priceData !== null) {
            return priceData.value || priceData.price || priceData.amount || 0;
        }
        
        return 0;
    };

    /**
     * Получает отсортированные URL изображений меню для попапа
     * @returns {string[]} Массив URL изображений меню, отсортированных по порядку
     */
    const getSortedMenuImageUrls = (): string[] => {
        if (!menu_imgs) return [];
        return menu_imgs
            .sort((a, b) => a.order - b.order)
            .map(item => item.image_url);
    };

    /**
     * Переход на новую страницу меню
     */
    const handleOpenInteractiveMenu = () => {
        navigate(`/restaurant/${restaurant_id}/menu`);
    };

    const menuImageUrls = getSortedMenuImageUrls();

    return (
        <ContentContainer>
            {menu_imgs && (
                <MenuPopup
                    isOpen={isMenuPopupOpen}
                    setOpen={setIsMenuPopupOpen}
                    menuItems={menuImageUrls}
                />
            )}

            <ContentBlock>
                <HeaderContainer id="menu">
                    <HeaderContent title="Меню" />
                </HeaderContainer>

                {/* Слайдер блюд меню */}
                {menuItems.length > 0 && (
                <div className={css.photoSliderContainer}>
                    <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                            {menuItems.map((item, index) => {
                                const defaultSize = item.item_sizes.find(s => s.is_default) || item.item_sizes[0];
                                const imageUrl = defaultSize?.button_image_url || '';
                                const price = extractPrice(defaultSize?.prices);

                                return (
                            <SwiperSlide
                                style={{ width: '162px' }}
                                key={`${item.id}-${index}`}
                            >
                                <div className={css.menuItem}>
                                    <div
                                        className={classNames(css.menuItemPhoto, css.bgImage)}
                                                style={{ 
                                                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                                                    backgroundColor: imageUrl ? 'transparent' : '#F4F4F4'
                                                }}
                                    />
                                    <div className={css.menuItemInfo}>
                                                <span className={css.title}>{item.name}</span>
                                                {price > 0 && <span className={css.subtitle}>{price} ₽</span>}
                                    </div>
                                </div>
                            </SwiperSlide>
                                );
                            })}
                    </Swiper>
                </div>
                )}

                {/* Кнопка открытия полного меню */}
                <UniversalButton
                    title="Всё меню"
                    width="full"
                    action={handleOpenInteractiveMenu}
                />
            </ContentBlock>
        </ContentContainer>
    );
};
