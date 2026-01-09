import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// Types
import { IPhotoCard } from '@/types/restaurant.types.ts';
import { GalleryCollection, GalleryPhoto } from '@/pages/RestaurantPage/RestaurantPage.types';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ImageViewerPopup } from '@/components/ImageViewerPopup/ImageViewerPopup.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

/**
 * Пропсы компонента GalleryBlock.
 *
 * @interface IGalleryBlockProps
 */
interface IGalleryBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Преобразует массив фотографий в структурированную галерею с группировкой по категориям
 * @param {IPhotoCard[]} gallery - Массив фотографий ресторана
 * @returns {GalleryCollection[]} Структурированная галерея с категориями
 */
export const transformGallery = (gallery: IPhotoCard[]): GalleryCollection[] => {
    const groupedByCategory: Record<string, GalleryPhoto[]> = {};

    gallery.forEach((photo) => {
        if (!groupedByCategory[photo.category]) {
            groupedByCategory[photo.category] = [];
        }
        groupedByCategory[photo.category].push({ link: photo.url });
    });

    return Object.entries(groupedByCategory).map(([title, photos]) => ({
        title,
        photos,
    }));
};

/**
 * Компонент для отображения галереи фотографий.
 *
 * @component
 * @example
 * <GalleryBlock restaurantId="1" />
 */
export const GalleryBlock: React.FC<IGalleryBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Состояние открытия просмотрщика фотографий.
     */
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    /**
     * Фотография для просмотра.
     */
    const [currentImageViewerPhoto, setCurrentImageViewerPhoto] = useState('');
    /**
     * Галерея.
     */
    const [gallery, setGallery] = useState<GalleryCollection[]>([]);
    /**
     * Категория фотографий.
     */
    const [currentGalleryCategory, setCurrentGalleryCategory] = useState('Все фото');
    /**
     * Фотографии для отображения в галерее.
     */
    const [currentGalleryPhotos, setCurrentGalleryPhotos] = useState<(string | string[])[]>([]);
    /**
     * Фотографии ресторана.
     */
    const restaurantGallery = useMemo(() => restaurant?.photo_cards || [], [restaurant]);

    /**
     * Получает фотографии для отображения в галерее
     * @returns {Array<string | string[]>} Массив сгруппированных фотографий
     */
    const getGalleryPhotos = (): (string | string[])[] => {
        /**
         * Список фотографий.
         */
        let photoList: string[] = [];
        /**
         * Если выбрана категория "Все фото", то добавляем все фотографии из всех категорий.
         */
        if (currentGalleryCategory === 'Все фото') {
            // Собираем все уникальные фото из всех категорий
            gallery.forEach((category) => {
                category.photos.forEach((photo) => photoList.push(photo.link));
            });
            /**
             * Убираем дубликаты фотографий.
             */
            photoList = [...new Set(photoList)];
        } else {
            // Собираем фото только из выбранной категории
            const selectedCategory = gallery.find((item) => item.title === currentGalleryCategory);
            selectedCategory?.photos.forEach((photo) => photoList.push(photo.link));
        }

        /**
         * Группируем фотографии для отображения в галерее.
         */
        const groupedPhotos: (string | string[])[] = [];
        /**
         * Индекс фотографии.
         */
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

    /**
     * Инициализация галереи при получении данных
     */
    useEffect(() => {
        if (restaurantGallery) {
            setGallery(transformGallery(restaurantGallery));
        }
    }, [restaurantGallery]);

    /**
     * Обновление отображаемых фото при изменении категории или галереи
     */
    useEffect(() => {
        setCurrentGalleryPhotos(getGalleryPhotos());
    }, [currentGalleryCategory, gallery]);

    if (!restaurantGallery) return <></> as JSX.Element;

    return (
        <ContentContainer>
            <ImageViewerPopup
                isOpen={isImageViewerOpen}
                setOpen={setIsImageViewerOpen}
                items={restaurantGallery}
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
