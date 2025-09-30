import { Page } from '@/components/Page.tsx';
import css from './ChooseBanquetOptionsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useEffect, useState } from 'react';
import { IBanquetOptions } from '@/types/banquets.ts';
import { banquetOptions } from '@/__mocks__/banquets.mock.ts';
import { DepositIcon } from '@/components/Icons/DepositIcon.tsx';
import { GuestsIcon } from '@/components/Icons/GuestsIcon.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

export const ChooseBanquetOptionsPage = () => {
    const navigate = useNavigate();
    const {restaurant_id} = useParams();

    const [banquets, setBanquets] = useState<IBanquetOptions[]>([])

    const goBack = () => {
        // navigate(`/restaurant/${restaurant_id}`);
        navigate(-1);
    }

    useEffect(() => {
        setBanquets(banquetOptions);
    }, []);
    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>Форматы посадки</span>
                        <div />
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            {banquets.map((banquet) => (
                                <div className={css.banquetContainer} key={banquet.id}>
                                    <img
                                        src={banquet.image_url} alt="banquet_img"
                                        onDragStart={event => event.preventDefault()} />
                                    <div className={css.banquetInfo}>
                                        <span className={css.banquet_title}>{banquet.name}</span>
                                        <div className={css.banquetInfoRow}>
                                            <div className={css.banquetInfoCol}>
                                                <div>
                                                    <DepositIcon />
                                                    <span className={css.banquet_text}>{banquet.deposit ? banquet.deposit : banquet.conditions}</span>
                                                </div>
                                                <div>
                                                    <GuestsIcon />
                                                    <span className={css.banquet_text}>до {banquet.guests_limit} человек</span>
                                                </div>
                                            </div>
                                        <UniversalButton
                                            title={'Выбрать'}
                                            theme={'red'}
                                            width={'full'}
                                            action={() => navigate(`/banquets/${restaurant_id}/option`, { state: { banquet } })}
                                        />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ContentBlock>
                    </ContentContainer>
                </div>
            </div>
        </Page>
    )
}
