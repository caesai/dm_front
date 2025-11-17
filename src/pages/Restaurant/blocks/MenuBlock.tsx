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
    const [menuPopupOpen, setMenuPopupOpen] = useState(false);
    return (
        <ContentContainer>
            {menu_imgs ? (
                <MenuPopup
                    isOpen={menuPopupOpen}
                    setOpen={setMenuPopupOpen}
                    menuItems={menu_imgs.sort((a, b) => (a.order > b.order ? 1 : -1)).map((v) => v.image_url)}
                />
            ) : null}
            <ContentBlock>
                <HeaderContainer id={'menu'}>
                    <HeaderContent title={'Меню'} />
                    {/*<HeaderSubText text={'Рекомендуем'}/>*/}
                </HeaderContainer>
                <div className={css.photoSliderContainer}>
                    <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                        {menu &&
                            menu
                                .sort((a, b) => (a.id > b.id ? 1 : -1))
                                .map((item, index) => (
                                    <SwiperSlide style={{ width: '162px' }} key={`${index}${item.photo_url}`}>
                                        <div className={css.menuItem}>
                                            <div
                                                className={classNames(css.menuItemPhoto, css.bgImage)}
                                                style={{
                                                    backgroundImage: `url(${item.photo_url})`,
                                                }}
                                            ></div>
                                            <div className={css.menuItemInfo}>
                                                <span className={css.title}>{item.title}</span>
                                                <span className={css.subtitle}>{item.price} ₽</span>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                    </Swiper>
                </div>
                <UniversalButton title={'Посмотреть меню'} width={'full'} action={() => setMenuPopupOpen(true)} />
            </ContentBlock>
        </ContentContainer>
    );
};
