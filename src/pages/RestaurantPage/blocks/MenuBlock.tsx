import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
// Atoms
import { permissionsAtom } from '@/atoms/userAtom.ts';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Utils
import { extractPrice, getDefaultSize } from '@/utils/menu.utils.ts';
// Hooks
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { MenuPopup } from '@/components/MenuPopup/MenuPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
/**
 * Пропсы компонента MenuBlock.
 *
 * @interface IMenuBlockProps
 */
interface IMenuBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}
// Блок меню
// TODO: новая версия меню доступна пользователям с разрешением menu_tester
// как только будет реализована новая версия меню, нужно будет удалить старый блок меню
/**
 * Компонент MenuBlock.
 * @param {IMenuBlockProps} props
 * @returns {JSX.Element}
 */
export const MenuBlock: React.FC<IMenuBlockProps> = ({ restaurantId }: IMenuBlockProps): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Меню ресторана.
     */
    // Получаем меню ресторана
    const restaurantMenu = useMemo(() => restaurant?.menu || [], [restaurant]);
    // Получаем изображения меню ресторана
    const restaurantMenuImgs = useMemo(() => restaurant?.menu_imgs || [], [restaurant]);
    // Получаем разрешения пользователя
    const permissions = useAtomValue(permissionsAtom);
    // Навигация
    const navigate = useNavigate();
    // Открываем popup с меню (старая версия меню)
    const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
    // Новая версия меню берет данные из базы данных, а не из menu_imgs
    const { menuData } = useRestaurantMenu(restaurantId);
    // Получаем блюда из базы данных
    const menuItems = useMemo(() => {
        if (!menuData) return [];
        return menuData.item_categories
            .filter((cat) => !cat.is_hidden)
            .flatMap((cat) => cat.menu_items.filter((item) => !item.is_hidden))
            .slice(0, 10);
    }, [menuData]);

    // Сортируем блюда по id (старая версия меню) 
    // slice() - создаем копию массива, чтобы не изменять исходный массив
    const sortedMenuItems = restaurantMenu?.slice().sort((a, b) => a.id - b.id) || [];
    // Получаем URL изображений блюд из menu_imgs (старая версия меню)
    const menuImageUrls = useMemo(() => {
        if (!restaurantMenuImgs) return [];
        return restaurantMenuImgs.sort((a, b) => a.order - b.order).map((item) => item.image_url);
    }, [restaurantMenuImgs]);
    // Открываем интерактивное меню (новая версия меню)
    const handleOpenInteractiveMenu = () => {
        navigate(`/restaurant/${restaurantId}/menu`);
    };

    // Открываем popup с меню (старая версия меню)
    const handleOpenMenuPopup = () => {
        setIsMenuPopupOpen(true);
    };

    return (
        <ContentContainer id="menu">
            {/* Открываем popup с меню (старая версия меню) */}
            {restaurantMenuImgs && <MenuPopup isOpen={isMenuPopupOpen} setOpen={setIsMenuPopupOpen} menuItems={menuImageUrls} />}
            {/* Блок контента */}
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title="Меню" />
                </HeaderContainer>

                {/* Слайдер блюд меню доступен всем пользователям */}
                {!permissions.includes('menu_tester') && (
                    <div className={css.photoSliderContainer}>
                        <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                            {sortedMenuItems.map((item, index) => (
                                <SwiperSlide style={{ width: '162px' }} key={`${item.id}-${index}`}>
                                    <div className={css.menuItem}>
                                        <div
                                            className={classNames(css.menuItemPhoto, css.bgImage)}
                                            style={{ backgroundImage: `url(${item.photo_url})` }}
                                        />
                                        <div className={css.menuItemInfo}>
                                            <span className={css.title}>{item.title}</span>
                                            <span className={css.subtitle}>{item.price} ₽</span>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
                {/* Слайдер новой версии блюд меню доступен пользователям с разрешением menu_tester */}
                {permissions.includes('menu_tester') && menuItems.length > 0 && (
                    <div className={css.photoSliderContainer}>
                        <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                            {menuItems.map((item, index) => {
                                const defaultSize = getDefaultSize(item.item_sizes);
                                const imageUrl = defaultSize?.button_image_url || '';
                                const price = extractPrice(defaultSize?.prices);

                                return (
                                    <SwiperSlide style={{ width: '162px' }} key={`${item.id}-${index}`}>
                                        <div className={css.menuItem}>
                                            <div
                                                className={classNames(css.menuItemPhoto, css.bgImage)}
                                                style={{
                                                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                                                    backgroundColor: imageUrl ? 'transparent' : '#F4F4F4',
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

                <UniversalButton
                    title="Всё меню"
                    width="full"
                    // Если пользователь имеет разрешение menu_tester, открываем страницу меню, иначе открываем popup с меню
                    action={permissions.includes('menu_tester') ? handleOpenInteractiveMenu : handleOpenMenuPopup}
                />
            </ContentBlock>
        </ContentContainer>
    );
};
