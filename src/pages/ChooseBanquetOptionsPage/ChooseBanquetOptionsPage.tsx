/**
 * @fileoverview Страница выбора опций для банкета.
 * 
 * Второй шаг в процессе бронирования банкета:
 * 1. BanquetAddressPage (выбор ресторана)
 * 2. ChooseBanquetOptionsPage (выбор опции банкета) <- текущая страница
 * 3. BanquetOptionPage (настройка банкета)
 * 4. BanquetAdditionalServicesPage (дополнительные услуги) - опционально
 * 5. BanquetReservationPage (подтверждение)
 * 
 * Функциональность страницы:
 * - Отображение списка доступных банкетных опций ресторана
 * - Карусель изображений для каждой опции (Swiper)
 * - Информация о вместимости и депозите
 * - Описание опции с возможностью раскрытия (> 60 символов)
 * - Галерея изображений при клике на слайд
 * 
 * @module pages/ChooseBanquetOptionsPage
 * 
 * @see {@link BanquetAddressPage} - предыдущий шаг (выбор ресторана)
 * @see {@link BanquetOptionPage} - следующий шаг (настройка опции)
 * @see {@link BanquetGallery} - компонент галереи изображений
 */
import React, { Fragment, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import classnames from 'classnames';
// Types
import { IBanquetOptions } from '@/types/banquets.types.ts';
// Hooks
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import BanquetGallery from '@/components/BanquetGallery/BanquetGallery.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// Styles
import 'swiper/css';
import 'swiper/css/pagination';
import css from '@/pages/ChooseBanquetOptionsPage/ChooseBanquetOptionsPage.module.css';

/**
 * Страница выбора опций для банкета.
 * 
 * Отображает список доступных банкетных опций выбранного ресторана.
 * Каждая опция представлена карточкой с каруселью изображений,
 * информацией о вместимости, депозите и описанием.
 * 
 * @returns {JSX.Element} - Компонент страницы выбора опций для банкета
 * 
 * @example
 * // URL: /banquets/:restaurantId/choose
 * // Загружает опции из restaurant.banquets.banquet_options
 */
export const ChooseBanquetOptionsPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const restaurant = useGetRestaurantById(restaurantId || '');
    
    /**
     * Список банкетных опций текущего ресторана.
     * Загружается из restaurant.banquets.banquet_options.
     */
    const banquetOptions = useMemo(() => {
        return restaurant?.banquets?.banquet_options || [];
    }, [restaurant]);

    /** Флаг открытия галереи изображений */
    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    /** Массив изображений для текущей галереи */
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    /** Индекс текущего изображения в галерее */
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    /** ID опции с раскрытым описанием (null = все свёрнуты) */
    const [hideAboutId, setHideAboutId] = useState<number | null>(null);

    /**
     * Навигация назад на страницу выбора ресторана.
     */
    const goBack = () => {
        navigate(`/banquets/${restaurantId}/address`);
    };

    /**
     * Открывает галерею изображений для выбранной опции.
     * 
     * @param banquet - Банкетная опция с изображениями
     * @param index - Индекс выбранного изображения в карусели
     */
    const openPopup = (banquet: IBanquetOptions, index: number) => {
        setOpenPopup(true);
        setImageIndex(index);
        setCurrentImages(banquet.images);
    };

    /**
     * Форматирует информацию о депозите для отображения.
     * 
     * @param banquet - Банкетная опция
     * @returns Строка с информацией о депозите:
     *   - "от X₽ на гостя" если есть сумма депозита
     *   - Кастомное сообщение если есть deposit_message
     *   - "Без депозита" если нет данных
     */
    const getBanquetDeposit = (banquet: IBanquetOptions) => {
        if (banquet.deposit) {
            return `от ${banquet.deposit}₽ на гостя`;
        }
        return banquet.deposit_message || 'Без депозита';
    };

    /**
     * Переключает раскрытие/сворачивание описания опции.
     * 
     * @param id - ID банкетной опции
     * @remarks
     * Только одно описание может быть раскрыто одновременно.
     * Повторный клик на ту же опцию сворачивает описание.
     */
    const toggleDescription = (id: number) => {
        setHideAboutId((prevId) => (prevId === id ? null : id));
    };

    return (
        <Page back={true} className={css.page}>
            <BanquetGallery
                isOpen={isOpenPopup}
                setOpen={setOpenPopup}
                images={currentImages}
                currentIndex={imageIndex!}
            />
            <PageContainer className={css.pageWrapper}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={goBack}></RoundedButton>
                    <HeaderContent className={css.header_title} title="Подбор опций для банкета" />
                    <div style={{ width: 20 }} />
                </ContentBlock>
                <ContentContainer className={css.contentContainer}>
                    {banquetOptions && banquetOptions.length > 0 ? (
                        banquetOptions.map((option: IBanquetOptions) => (
                            <ContentBlock className={css.blockContainer} key={option.id}>
                                <Swiper
                                    pagination={{
                                        type: 'bullets',
                                        clickable: true,
                                    }}
                                    observer={true}
                                    modules={[Pagination]}
                                    className={classnames(css.swiper)}
                                >
                                    {option.images.map((image: string, index: number) => (
                                        <SwiperSlide
                                            className={css.slide}
                                            key={index}
                                            onClick={() => openPopup(option, index)}
                                        >
                                            <img src={image} alt={'banquet_img'} />
                                            <div className={css.banquetStats}>
                                                <div>
                                                    <span>до {option.guests_max} человек</span>
                                                </div>
                                                <div>
                                                    <span>{getBanquetDeposit(option)}</span>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <div className={css.banquetInfo}>
                                    <span className={css.banquet_title}>{option.name}</span>
                                    {option.description && (
                                        <span
                                            className={classnames(
                                                css.banquet_text,
                                                hideAboutId !== option.id && option.description.length > 60
                                                    ? css.trimLines
                                                    : null
                                            )}
                                        >
                                            {option.description
                                                .split(/\n|\r\n/)
                                                .map((segment: string, index: number) => (
                                                    <Fragment key={index}>
                                                        {index > 0 && <br />}
                                                        {segment}
                                                    </Fragment>
                                                ))}
                                        </span>
                                    )}
                                    {option.description && option.description.length > 60 && (
                                        <div
                                            className={css.trimLinesButton}
                                            onClick={() => toggleDescription(option.id)}
                                        >
                                            <span className={css.text}>
                                                {hideAboutId !== option.id ? 'Читать больше' : 'Скрыть'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={css.banquet_button}>
                                        <UniversalButton
                                            width={'full'}
                                            title={'Выбрать'}
                                            theme={'red'}
                                            action={() => navigate(`/banquets/${restaurantId}/option/${option.id}`)}
                                        />
                                    </div>
                                </div>
                            </ContentBlock>
                        ))
                    ) : (
                        <h1 className={css.no_banquets}>Нет доступных опций для банкета</h1>
                    )}
                </ContentContainer>
            </PageContainer>
        </Page>
    );
};
