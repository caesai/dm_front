import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IPhotoCard } from '@/types/restaurant.types.ts';
import { GalleryCollection } from '@/pages/RestaurantPage/RestaurantPage.types';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ImageViewerPopup } from '@/components/ImageViewerPopup/ImageViewerPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { transformGallery } from '@/pages/RestaurantPage/RestaurantPage';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface GalleryBlockProps {
    restaurant_gallery: IPhotoCard[] | undefined;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ restaurant_gallery }) => {
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [currentImageViewerPhoto, setCurrentImageViewerPhoto] = useState('');
    const [gallery, setGallery] = useState<GalleryCollection[]>([]);
    const [currentGalleryCategory, setCurrentGalleryCategory] = useState('Все фото');
    const [currentGalleryPhotos, setCurrentGalleryPhotos] = useState<(string | string[])[]>([]);

    /**
     * Группирует фотографии для отображения в галерее
     * Чередует одиночные фото и пары маленьких фото для визуального разнообразия
     * @returns {Array<string | string[]>} Массив сгруппированных фотографий
     */
    const getGalleryPhotos = (): (string | string[])[] => {
        let photoList: string[] = [];

        if (currentGalleryCategory === 'Все фото') {
            // Собираем все уникальные фото из всех категорий
            gallery.forEach((category) => {
                category.photos.forEach((photo) => photoList.push(photo.link));
            });
            photoList = [...new Set(photoList)];
        } else {
            // Собираем фото только из выбранной категории
            const selectedCategory = gallery.find((item) => item.title === currentGalleryCategory);
            selectedCategory?.photos.forEach((photo) => photoList.push(photo.link));
        }

        const groupedPhotos: (string | string[])[] = [];
        let index = 0;

        while (index < photoList.length) {
            // Добавляем одно большое фото
            groupedPhotos.push(photoList[index]);
            index++;

            // Добавляем пару маленьких фото, если есть достаточно элементов
            if (index < photoList.length - 1) {
                groupedPhotos.push([photoList[index], photoList[index + 1]]);
                index += 2;
            }
        }

        return groupedPhotos;
    };

    /**
     * Обрабатывает клик по фотографии для открытия в просмотрщике
     * @param {string} photoUrl - URL фотографии для отображения
     */
    const handlePhotoClick = (photoUrl: string) => {
        setCurrentImageViewerPhoto(photoUrl);
        setIsImageViewerOpen(true);
    };

    // Инициализация галереи при получении данных
    useEffect(() => {
        if (restaurant_gallery) {
            setGallery(transformGallery(restaurant_gallery));
        }
    }, [restaurant_gallery]);

    // Обновление отображаемых фото при изменении категории или галереи
    useEffect(() => {
        setCurrentGalleryPhotos(getGalleryPhotos());
    }, [currentGalleryCategory, gallery]);

    if (!restaurant_gallery) return null;

    return (
        <ContentContainer>
            <ImageViewerPopup
                isOpen={isImageViewerOpen}
                setOpen={setIsImageViewerOpen}
                items={restaurant_gallery}
                currentItem={currentImageViewerPhoto}
                setCurrentItem={setCurrentImageViewerPhoto}
            />

            <ContentBlock id="gallery">
                <HeaderContainer>
                    <HeaderContent title="Галерея" />

                    {/* Навигация по категориям фото */}
                    <div className={css.photoSliderNavigationContainer}>
                        <Swiper modules={[FreeMode]} freeMode={true} slidesPerView="auto" spaceBetween={4}>
                            <SwiperSlide
                                style={{ width: 'max-content' }}
                                onClick={() => setCurrentGalleryCategory('Все фото')}
                            >
                                <div
                                    className={classNames(
                                        css.photoSliderNavigationItem,
                                        currentGalleryCategory === 'Все фото' && css.photoSliderNavigationActive
                                    )}
                                >
                                    Все фото
                                </div>
                            </SwiperSlide>
                            {gallery.map((category, index) => (
                                <SwiperSlide
                                    style={{ width: 'max-content' }}
                                    key={index}
                                    onClick={() => setCurrentGalleryCategory(category.title)}
                                >
                                    <div
                                        className={classNames(
                                            css.photoSliderNavigationItem,
                                            currentGalleryCategory === category.title && css.photoSliderNavigationActive
                                        )}
                                    >
                                        {category.title}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </HeaderContainer>

                {/* Галерея фотографий */}
                <div className={css.photoSliderContainer}>
                    <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                        {currentGalleryPhotos.map((photo, index) => (
                            <SwiperSlide
                                key={`${index}-${Array.isArray(photo) ? photo.join('-') : photo}`}
                                style={{ width: 'max-content' }}
                                className={Array.isArray(photo) ? css.smallPhotoSlideContainer : css.photoBig}
                            >
                                {Array.isArray(photo) ? (
                                    // Контейнер для пары маленьких фото
                                    <div className={css.smallPhotoContainer}>
                                        {photo.map((smallPhoto, smallIndex) => (
                                            <div
                                                key={`${smallIndex}-${smallPhoto}`}
                                                className={classNames(css.photo, css.photoSmall)}
                                                style={{ backgroundImage: `url(${smallPhoto})` }}
                                                onClick={() => handlePhotoClick(smallPhoto)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    // Большое одиночное фото
                                    <div
                                        className={classNames(css.photo, css.photoBig)}
                                        style={{ backgroundImage: `url(${photo})` }}
                                        onClick={() => handlePhotoClick(photo)}
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
