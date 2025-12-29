import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
// Types
import { IMenuImg } from '@/types/restaurant.types.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
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
interface MenuBlockProps {
    menu_imgs: IMenuImg[] | undefined;
    restaurant_id: number;
}

export const MenuBlock: React.FC<MenuBlockProps> = ({ menu_imgs, restaurant_id }) => {
    const user = useAtomValue(userAtom);
    const navigate = useNavigate();
    const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);

    const { menuData } = useRestaurantMenu(restaurant_id);

    const menuItems = useMemo(() => {
        if (!menuData) return [];
        return menuData.item_categories
            .filter(cat => !cat.is_hidden)
            .flatMap(cat => cat.menu_items.filter(item => !item.is_hidden))
            .slice(0, 10);
    }, [menuData]);

    const menuImageUrls = useMemo(() => {
        if (!menu_imgs) return [];
        return menu_imgs
            .sort((a, b) => a.order - b.order)
            .map(item => item.image_url);
    }, [menu_imgs]);

    const handleOpenInteractiveMenu = () => {
        navigate(`/restaurant/${restaurant_id}/menu`);
    };

    const handleOpenMenuPopup = () => {
        setIsMenuPopupOpen(true);
    };

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

                {menuItems.length > 0 && (
                    <div className={css.photoSliderContainer}>
                        <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                            {menuItems.map((item, index) => {
                                const defaultSize = getDefaultSize(item.item_sizes);
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

                <UniversalButton
                    title="Всё меню"
                    width="full"
                    action={user?.permissions.includes('menu_tester') ? handleOpenInteractiveMenu : handleOpenMenuPopup}
                />
            </ContentBlock>
        </ContentContainer>
    );
};
