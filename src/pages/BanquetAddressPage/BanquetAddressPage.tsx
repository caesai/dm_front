import { Page } from '@/components/Page.tsx';
import css from './BanquetAddressPage.module.css'
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import BanquetImg from '/img/banquet_img.png';

export const BanquetAddressPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const goBack = () => {
        navigate(`/restaurant/${id}`);
    };

    const goNextPage = () => {
        navigate(`/banquets/${id}/choose`);
    }

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>
                            Банкеты
                        </span>
                        <div style={{ width: 40 }} />
                    </div>
                    <div className={css.container}>
                        <div className={css.banquet_content}>
                            <span className={css.banquet_title}>Подарите приятный вечер в <br /> ресторанах Dreamteam</span>
                            <img src={BanquetImg} alt={'Банкет'} className={css.banquet_img} />
                            <span className={css.banquet_text}>Текст про банкеты</span>
                        </div>
                        <div className={css.address_content}>
                            <h3 className={css.content_title}>Адрес ресторана</h3>
                        </div>
                    </div>
                </div>
                <BottomButtonWrapper content={'Продолжить'} onClick={goNextPage} />
            </div>
        </Page>
    )
}
