import { Page } from '@/components/Page.tsx';
import css from './BanquetReservation.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import {DownArrow} from '@/components/Icons/DownArrow';
import { RadioInput } from '@/components/RadioInput/RadioInput.tsx';
import { useState } from 'react';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

export const BanquetReservationPage = () => {
    const navigate = useNavigate();
    const {restaurant_id} = useParams();

    const [selectedOption, setSelectedOption] = useState<string | undefined>();

    const goBack = () => {
        navigate(`/banquets/${restaurant_id}/option`);
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
                        <span className={css.header_title}>Бронирование банкета</span>
                        <div />
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            <div className={css.info}>
                                <div className={css.info_container}>
                                    <div className={css.info__left}>
                                        <div>
                                            <span>Имя</span>
                                            <span>Тимофей</span>
                                        </div>
                                        <div>
                                            <span>Дата</span>
                                            <span>10.12.2025</span>
                                        </div>
                                        <div>
                                            <span>Гости</span>
                                            <span>14</span>
                                        </div>
                                    </div>
                                    <div className={css.info__right}>
                                        <div>
                                            <span>Номер телефона</span>
                                            <span>+7 (900) 123-45-67</span>
                                        </div>
                                        <div>
                                            <span>Время</span>
                                            <span>с 10:00 по 14:00</span>
                                        </div>
                                        <div>
                                            <span>Повод</span>
                                            <span>День рождения</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={css.additionalServices}>
                                    <span>Дополнительные услуги</span>
                                    <span>
                                        Индивидуальное оформление площадки,
                                        Винное сопровождение, Музыка / Группа
                                    </span>
                                </div>
                            </div>
                        </ContentBlock>
                        <ContentBlock>
                            <div className={css.commentary}>
                                <span>Комментарий</span>
                                <input />
                            </div>
                        </ContentBlock>
                        <ContentBlock>
                            <div className={css.connect}>
                                <div className={css.connectTitle}>
                                    <span>Способ связи</span>
                                    <div className={css.topArrow}>
                                        <DownArrow size={14} />
                                    </div>
                                </div>
                                <div className={css.radio_container}>
                                    <RadioInput
                                        title={'Telegram'}
                                        checked={selectedOption === 'telegram'}
                                        onChange={() => setSelectedOption('telegram')}
                                    />
                                    <RadioInput
                                        title={'Телефон'}
                                        checked={selectedOption === 'phone'}
                                        onChange={() => setSelectedOption('phone')}
                                    />
                                </div>
                            </div>
                        </ContentBlock>
                        <ContentBlock>
                            <span className={css.price_title}>* Предварительная стоимость:</span>
                            <div className={css.price}>
                                <div>
                                    <span>Депозит за человека:</span>
                                    <span>10 000 ₽</span>
                                </div>
                                <div>
                                    <span>Депозит итого:</span>
                                    <span>150 000 ₽</span>
                                </div>
                                <div>
                                    <span>Сервисный сбор:</span>
                                    <span>10%</span>
                                </div>
                                <div>
                                    <span>Итого:</span>
                                    <span>165 000 ₽</span>
                                </div>
                                <p>
                                    *Окончательная стоимость банкета будет
                                    определена после того, как вы сформируете запрос,
                                    и мы свяжемся с вами для уточнения всех деталей мероприятия.
                                </p>
                            </div>
                        </ContentBlock>
                        <UniversalButton
                            width={'full'}
                            title={'Забронировать'}
                            theme={'red'}
                        />
                    </ContentContainer>
                </div>
            </div>
        </Page>
    )
}