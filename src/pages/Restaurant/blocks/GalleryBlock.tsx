import { IPhotoCard } from '@/types/restaurant.ts';
import React, { useEffect, useState } from 'react';
import { GalleryCollection } from '@/pages/Restaurant/Restaurant.types.ts';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ImageViewerPopup } from '@/components/ImageViewerPopup/ImageViewerPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import classNames from 'classnames';
import { transformGallery } from '@/pages/Restaurant/Restaurant.tsx';

interface GalleryBlockProps {
    restaurant_gallery: IPhotoCard[] | undefined;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ restaurant_gallery }) => {
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageViewerPhoto, setCurrentImageViewerPhoto] = useState('');
    const [gallery, setGallery] = useState<GalleryCollection[]>([]);
    const [currentGalleryCategory, setCurrentGalleryCategory] = useState('Все фото');
    const [currentGalleryPhotos, setCurrentGalleryPhotos] = useState<(string | string[])[]>([]);
    const getGalleryPhotos = () => {
        let photoList: string[] = [];

        if (currentGalleryCategory === 'Все фото') {
            gallery.forEach((g) => {
                g.photos.forEach((photo) => photoList.push(photo.link));
            });
            photoList = [...new Set(photoList)];
        } else {
            const searchedGallery = gallery.find((item) => item.title === currentGalleryCategory);
            searchedGallery?.photos.forEach((photo) => photoList.push(photo.link));
        }

        const groupedPhotos: (string | string[])[] = [];
        let i = 0;

        while (i < photoList.length) {
            groupedPhotos.push(photoList[i]);
            i++;

            if (i < photoList.length - 1) {
                groupedPhotos.push([photoList[i], photoList[i + 1]]);
                i += 2;
            }
        }

        return groupedPhotos;
    };
    useEffect(() => {
        if (restaurant_gallery) {
            setGallery(transformGallery(restaurant_gallery));
        }
    }, [restaurant_gallery]);

    useEffect(() => {
        setCurrentGalleryPhotos(getGalleryPhotos());
    }, [currentGalleryCategory, gallery]);
    return (
        <ContentContainer>
            {restaurant_gallery && (
                <ImageViewerPopup
                    isOpen={imageViewerOpen}
                    setOpen={setImageViewerOpen}
                    items={restaurant_gallery}
                    currentItem={currentImageViewerPhoto}
                    setCurrentItem={setCurrentImageViewerPhoto}
                />
            )}
            <ContentBlock id={'gallery'}>
                <HeaderContainer>
                    <HeaderContent title={'Галерея'} />
                    <div className={css.photoSliderNavigationContainer}>
                        <Swiper modules={[FreeMode]} freeMode={true} slidesPerView={'auto'} spaceBetween={4}>
                            <SwiperSlide
                                style={{ width: 'max-content' }}
                                onClick={() => setCurrentGalleryCategory('Все фото')}
                            >
                                <div
                                    className={classNames(
                                        css.photoSliderNavigationItem,
                                        currentGalleryCategory == 'Все фото' ? css.photoSliderNavigationActive : null
                                    )}
                                >
                                    Все фото
                                </div>
                            </SwiperSlide>
                            {gallery.map((d, i) => (
                                <SwiperSlide
                                    style={{ width: 'max-content' }}
                                    key={i}
                                    onClick={() => setCurrentGalleryCategory(d.title)}
                                >
                                    <div
                                        className={classNames(
                                            css.photoSliderNavigationItem,
                                            currentGalleryCategory == d.title ? css.photoSliderNavigationActive : null
                                        )}
                                    >
                                        {d.title}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </HeaderContainer>
                <div className={css.photoSliderContainer}>
                    <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                        {currentGalleryPhotos.map((photo, index) => (
                            <SwiperSlide
                                key={`${index}${photo}`}
                                style={{ width: 'max-content' }}
                                className={Array.isArray(photo) ? css.smallPhotoSlideContainer : css.photoBig}
                            >
                                {Array.isArray(photo) ? (
                                    <div className={css.smallPhotoContainer}>
                                        {photo.map((smallPhoto, i) => (
                                            <div
                                                key={`${i}${smallPhoto}`}
                                                className={classNames(css.photo, css.photoSmall)}
                                                style={{
                                                    backgroundImage: `url(${smallPhoto})`,
                                                }}
                                                onClick={() => {
                                                    setCurrentImageViewerPhoto(smallPhoto);
                                                    setImageViewerOpen(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className={classNames(css.photo, css.photoBig)}
                                        style={{
                                            backgroundImage: `url(${photo})`,
                                        }}
                                        onClick={() => {
                                            setCurrentImageViewerPhoto(photo);
                                            setImageViewerOpen(true);
                                        }}
                                    />
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};