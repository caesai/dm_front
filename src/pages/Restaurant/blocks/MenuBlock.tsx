import { IMenuImg, IMenuItem } from '@/types/restaurant.ts';
import React, { useState } from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { MenuPopup } from '@/components/MenuPopup/MenuPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

interface MenuBlockProps {
    menu: IMenuItem[] | undefined;
    menu_imgs: IMenuImg[] | undefined;
}

export const MenuBlock: React.FC<MenuBlockProps> = ({ menu, menu_imgs }) => {
    const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);

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
     * Обрабатывает открытие попапа с меню
     */
    const handleOpenMenuPopup = () => {
        setIsMenuPopupOpen(true);
    };

    const sortedMenuItems = menu?.sort((a, b) => a.id - b.id) || [];
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
                <div className={css.photoSliderContainer}>
                    <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                        {sortedMenuItems.map((item, index) => (
                            <SwiperSlide
                                style={{ width: '162px' }}
                                key={`${item.id}-${index}`}
                            >
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

                {/* Кнопка открытия полного меню */}
                <UniversalButton
                    title="Посмотреть меню"
                    width="full"
                    action={handleOpenMenuPopup}
                />
            </ContentBlock>
        </ContentContainer>
    );
};