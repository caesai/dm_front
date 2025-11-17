import { Page } from '@/components/Page.tsx';
import css from './ChooseBanquetOptionsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { IBanquet, IBanquetOptions } from '@/types/banquets.types.ts';
import { GuestsIcon } from '@/components/Icons/GuestsIcon.tsx';
import { IWorkTime } from '@/types/restaurant.ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import classnames from 'classnames';
import BanquetGallery from '@/components/BanquetGallery/BanquetGallery.tsx';
import { useState } from 'react';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classNames from 'classnames';

export const ChooseBanquetOptionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const banquets: IBanquet = location.state?.banquets;
    const workTime: IWorkTime[] = location.state?.workTime;
    const restaurant_title = location.state?.restaurant_title;
    const { id } = useParams();

    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    const [hideAbout, setHideAbout] = useState<boolean>(true);

    const goBack = () => {
        navigate(`/restaurant/${id}`);
    };

    const openPopup = (banquet: IBanquetOptions, index: number) => {
        setOpenPopup(true);
        setImageIndex(index)
        setCurrentImages(banquet.images);
    };

    const getBanquetDeposit = (banquet: IBanquetOptions) => {
        if (banquet.deposit) {
            return `от ${banquet.deposit}₽ на гостя`;
        }
        return banquet.deposit_message || "Без депозита";
    };

    return (
        <Page back={true}>
            <BanquetGallery isOpen={isOpenPopup} setOpen={setOpenPopup} images={currentImages} currentIndex={imageIndex!} />
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>Подбор опций для банкета</span>
                        <div style={{ width: 20 }} />
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            {banquets?.banquet_options && banquets.banquet_options.length > 0 ? (
                                banquets?.banquet_options.map((banquet) => (
                                    <div className={css.blockContainer} key={banquet.id}>
                                        <Swiper
                                            pagination={{
                                                type: 'bullets',
                                                clickable: true,
                                            }}
                                            observer={true}
                                            // navigation={true}
                                            modules={[Pagination]}
                                            className={classnames(css.swiper)}
                                        >
                                            {banquet.images.map((image, index) => (
                                                <SwiperSlide className={css.slide} key={index}
                                                             onClick={() => openPopup(banquet, index)}>
                                                    <img src={image} alt={'banquet_img'} />
                                                    <div className={css.banquetStats}>
                                                        <div>
                                                            <GuestsIcon color={'#FFFFFF'} />
                                                            <span>до {banquet.guests_max} человек</span>
                                                        </div>
                                                        <div>
                                                            {/*<DepositIcon color={'#FFFFFF'} />*/}
                                                            <span>{getBanquetDeposit(banquet)}</span>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                        <div className={css.banquetInfo}>
                                            <span className={css.banquet_title}>{banquet.name}</span>
                                            {banquet.description && (
                                                <span className={classNames(
                                                    css.banquet_text,
                                                    (hideAbout && banquet.description.length > 60) ? css.trimLines : null,
                                                )}>
                                                    {banquet.description.split(/\n|\r\n/).map((segment, index) => (
                                                        <>
                                                            {index > 0 && <br />}
                                                            {segment}
                                                        </>
                                                    ))}
                                                </span>
                                            )}
                                            {banquet.description && banquet.description.length > 60 &&
                                                (
                                                    <div
                                                        className={css.trimLinesButton}
                                                        onClick={() => setHideAbout((prev) => !prev)}
                                                    >
                                                        <span className={css.text}>
                                                            {hideAbout ? 'Читать больше' : 'Скрыть'}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            <div className={css.banquet_button}>
                                                <UniversalButton
                                                    width={'full'}
                                                    title={'Выбрать'}
                                                    theme={'red'}
                                                    action={() => navigate(`/banquets/${id}/option`, {
                                                        state: {
                                                            banquet,
                                                            additional_options: banquets.additional_options,
                                                            restaurant_title,
                                                            workTime,
                                                            banquets,
                                                        },
                                                    })} />
                                            </div>
                                        </div>
                                    </div>
                                ))

                            ) : (
                                <h1 className={css.no_banquets}>Нет доступных опций для банкета</h1>)
                            }
                        </ContentBlock>
                    </ContentContainer>
                </div>
            </div>
        </Page>
    );
};
