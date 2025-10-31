import { Page } from '@/components/Page.tsx';
import css from './ChooseBanquetOptionsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { IBanquet, IBanquetOptions } from '@/types/banquets.types.ts';
import { DepositIcon } from '@/components/Icons/DepositIcon.tsx';
import { GuestsIcon } from '@/components/Icons/GuestsIcon.tsx';
import { IWorkTime } from '@/types/restaurant.ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
// import 'swiper/css/navigation';
import { Pagination } from 'swiper/modules';
import classnames from 'classnames';
import BanquetGallery from '@/components/BanquetGallery/BanquetGallery.tsx';
import { useState } from 'react';

export const ChooseBanquetOptionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const banquets: IBanquet = location.state?.banquets;
    const workTime: IWorkTime[] = location.state?.workTime;
    const restaurant_title = location.state?.restaurant_title;
    const { id } = useParams();

    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    const [currentImages, setCurrentImages] = useState<string[]>([]);

    const goBack = () => {
        navigate(`/restaurant/${id}`);
    };

    const openPopup = (banquet: IBanquetOptions) => {
        setOpenPopup(true);
        setCurrentImages(banquet.images);
    };

    return (
        <Page back={true}>
            <BanquetGallery isOpen={isOpenPopup} setOpen={setOpenPopup} images={currentImages} />
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
                                    <div className={css.banquetContainer} key={banquet.id}>
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
                                                             onClick={() => openPopup(banquet)}>
                                                    <img src={image} alt={'banquet_img'} />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                        <div className={css.banquetInfo}>
                                            <span className={css.banquet_title}>{banquet.name}</span>
                                            <div className={css.banquetInfoRow}>
                                                <div className={css.banquetInfoCol}>
                                                    <div>
                                                        <GuestsIcon />
                                                        <span
                                                            className={css.banquet_text}>до {banquet.guests_max} человек</span>
                                                    </div>
                                                    <div>
                                                        <DepositIcon />
                                                        <span className={css.banquet_text}>
                                                            {banquet.deposit ? `от ${banquet.deposit} ₽ на гостя` : banquet.deposit_message}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={css.buttonContainer}>
                                                    <button
                                                        className={css.infoButton}
                                                        onClick={() => navigate(`/banquets/${id}/option`, {
                                                            state: {
                                                                banquet,
                                                                additional_options: banquets.additional_options,
                                                                restaurant_title,
                                                                workTime,
                                                                banquets,
                                                            },
                                                        })}
                                                    >
                                                        Выбрать
                                                    </button>
                                                </div>
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
