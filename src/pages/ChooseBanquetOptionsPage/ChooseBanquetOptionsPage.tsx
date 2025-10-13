import { Page } from '@/components/Page.tsx';
import css from './ChooseBanquetOptionsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { IBanquet } from '@/types/banquets.ts';
import { DepositIcon } from '@/components/Icons/DepositIcon.tsx';
import { GuestsIcon } from '@/components/Icons/GuestsIcon.tsx';

export const ChooseBanquetOptionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const banquets: IBanquet = location.state?.banquets;

    const {id} = useParams();
    const restaurant_title: IBanquet = location.state?.restaurant_title;

    // const [banquets, setBanquets] = useState<IBanquet>()

    const goBack = () => {
        navigate(-1);
    }
    //
    // useEffect(() => {
    //     // const banquet = getBanquetOptions(id);
    //     console.log('banquet: ', banquet)
    //     if (banquet) {
    //         setBanquets(banquet);
    //     }
    // }, [id]);


    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>Подбор опций для банкета</span>
                        <div style={{ width: 20 }}/>
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            {banquets?.banquet_options && banquets.banquet_options.length > 0 ? (
                                banquets?.banquet_options.map((banquet) => (
                                    <div className={css.banquetContainer} key={banquet.id}>
                                        <img
                                            src={banquet.images[0]} alt="banquet_img"
                                            onDragStart={event => event.preventDefault()} />
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
                                                            {banquet.deposit ?  `от ${banquet.deposit} ₽ на гостя` : banquet.deposit_message}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={css.buttonContainer}>
                                                    <button
                                                        className={css.infoButton}
                                                        onClick={() => navigate(`/banquets/${id}/option`, { state: { banquet: banquet, additional_options: banquets.additional_options, restaurant_title: restaurant_title } })}
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
    )
}
