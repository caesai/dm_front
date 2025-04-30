import Popup from 'reactjs-popup';
import { FC, useEffect, useState } from 'react';
import css from './ImageViewerPopup.module.css';
import 'reactjs-popup/dist/index.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import styled from 'styled-components';
import { IPhotoCard } from '@/types/restaurant.ts';

interface IFullScreenPopup {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    items: IPhotoCard[];
    currentItem: string;
    setCurrentItem: (x: string) => void;
}

const StyledPopup = styled(Popup)`
    &-overlay {
    }

    &-content {
        width: 100vw;
        height: 100vh;
        padding: 0;
    }
`;

export const ImageViewerPopup: FC<IFullScreenPopup> = (p) => {
    const onClose = () => p.setOpen(false);
    const [menuItems, setMenuItems] = useState<string[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setMenuItems(p.items.map((v) => v.url));
    }, [p.items]);

    useEffect(() => {
        const index = menuItems.findIndex((item) => item === p.currentItem);

        // Если элемент найден и индекс отличается от текущего, обновляем стейт
        if (index !== -1 && index !== currentSlide) {
            setCurrentSlide(index);
            console.log(index);
        }
    }, [p.currentItem]);
    // hack to prevent from scrolling on page
    useEffect(() => {
        if (p.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, [p.isOpen]);

    return (
        <StyledPopup open={p.isOpen} onClose={onClose} position={'top center'}>
            <div className={css.popup}>
                <div className={css.content}>
                    <div className={css.header}>
                        <span className={css.headerTitle}>Галерея</span>
                        <RoundedButton
                            icon={<CrossIcon size={44} color={'black'} />}
                            bgColor={'var(--primary-background) !important'}
                            action={() => onClose()}
                        />
                    </div>
                    <div className={css.swiper_container}>
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={8}
                            style={{ width: '100%' }}
                            initialSlide={currentSlide}
                        >
                            {menuItems.map((slide) => (
                                <SwiperSlide key={slide}>
                                    <div
                                        className={classNames(
                                            css.bgImage,
                                            css.currentImage
                                        )}
                                        style={{
                                            backgroundImage: `url(${slide})`,
                                        }}
                                    ></div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </StyledPopup>
    );
};
