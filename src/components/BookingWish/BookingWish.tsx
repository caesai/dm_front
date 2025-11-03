import React, { useState } from 'react';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import { InfoIcon } from '@/components/Icons/InfoIcon.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import css from '@/pages/BookingPage/BookingPage.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { getBookingCommentMock } from '@/mockData.ts';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { BookingInfoPopup } from '@/components/BookingInfoPopup/BookingInfoPopup.tsx';

interface BookingWishProps {
    guestCount: number;
    childrenCount: number;
    preOrder: boolean;
    setPreOrder: (preOrder: boolean) => void;
    restaurant: string;
    commentary: string;
    setCommentary: (commentary: string) => void;
}

export const BookingWish: React.FC<BookingWishProps> = (
    {
        guestCount,
        childrenCount,
        preOrder,
        setPreOrder,
        restaurant,
        commentary,
        setCommentary
    }) => {
    const [infoPopup, setInfoPopup] = useState(false);
    return (
        <ContentContainer>
            <BookingInfoPopup isOpen={infoPopup} setOpen={setInfoPopup} />
            <HeaderContainer>
                <HeaderContent title={'Пожелания к брони'} />
            </HeaderContainer>
            {(guestCount + childrenCount) >= 8 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckBoxInput
                        checked={preOrder}
                        toggle={() => setPreOrder(!preOrder)}
                        label={'Оформить предзаказ блюд и напитков'} />
                    <span onClick={() => setInfoPopup(true)}>
                        <InfoIcon size={14} />
                    </span>
                </div>
            )}
            <TextInput
                value={commentary}
                onChange={(e) => setCommentary(e)}
                placeholder={'Комментарий к брони'}
            />
            <div className={css.commentary_options}>
                <Swiper
                    slidesPerView="auto"
                    modules={[FreeMode]}
                    freeMode={true}
                    spaceBetween={8}
                >
                    {restaurant !== 'unset' && getBookingCommentMock(String(restaurant)).map((obj) => (
                        <SwiperSlide
                            key={obj.text}
                            style={{ width: 'max-content' }}
                        >
                            <CommentaryOptionButton
                                text={obj.text}
                                icon={obj.emoji}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </ContentContainer>
    );
};
