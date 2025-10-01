import { Page } from '@/components/Page.tsx';
import css from './BanquetReservation.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import {DownArrow} from '@/components/Icons/DownArrow';
import { RadioInput } from '@/components/RadioInput/RadioInput.tsx';
import { useState } from 'react';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { userAtom } from '@/atoms/userAtom.ts';
import { useAtom } from 'jotai';

export const BanquetReservationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();

    const [user] = useAtom(userAtom)

    const reservationData = location.state?.reservationData || location.state;

    const {
        date,
        timeFrom,
        timeTo,
        guestCount,
        restaurant_title,
        reason,
        selectedServices = [],
        price,
    } = reservationData;

    const [selectedOption, setSelectedOption] = useState<string | undefined>();

    const goBack = () => {
        navigate(`/banquets/${id}/option`);
    }

    const formattedDate = new Date(date).toLocaleDateString('ru-RU')
    const formatNumber = (number: string) => {
        return number[0] === '7' ?  `+ ${number}` : number
    }

    const services = selectedServices.length > 0
        ? selectedServices.join(', ')
        : 'Не выбраны';

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    ></RoundedButton>
                    <span className={css.header_title}>{restaurant_title}</span>
                    <div />
                </div>
                <ContentContainer>
                    <ContentBlock>
                        <div className={css.info}>
                            <div className={css.info_container}>
                                <div className={css.info__left}>
                                    <div>
                                        <span>Имя</span>
                                        <span>{user?.first_name}</span>
                                    </div>
                                    <div>
                                        <span>Дата</span>
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div>
                                        <span>Гости</span>
                                        <span>{guestCount.title}</span>
                                    </div>
                                </div>
                                <div className={css.info__right}>
                                    <div>
                                        <span>Номер телефона</span>
                                        {user && user.phone_number && (
                                            <span>{formatNumber(user.phone_number)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span>Время</span>
                                        <span>с {timeFrom} по {timeTo}</span>
                                    </div>
                                    <div>
                                        <span>Повод</span>
                                        <span>{reason}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={css.additionalServices}>
                                <span>Дополнительные услуги</span>
                                <span>
                                        {services}
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
                        <span className={css.price_title}>Предварительная стоимость*:</span>
                        <div className={css.price}>
                            <div>
                                <span>Депозит за человека:</span>
                                <span>{price.deposit} ₽</span>
                            </div>
                            <div>
                                <span>Депозит итого:</span>
                                <span>{price.totalDeposit} ₽</span>
                            </div>
                            <div>
                                <span>Сервисный сбор:</span>
                                <span>{price.serviceFee}%</span>
                            </div>
                            <div>
                                <span>Итого:</span>
                                <span>{price.total} ₽</span>
                            </div>
                            <p>
                                *Окончательная стоимость банкета будет
                                определена после того, как вы сформируете запрос,
                                и мы свяжемся с вами для уточнения всех деталей мероприятия.
                            </p>
                        </div>
                    </ContentBlock>
                    <div className={css.button}>
                        <UniversalButton
                            width={'full'}
                            title={'Забронировать'}
                            theme={'red'}
                        />
                    </div>
                </ContentContainer>

            </div>
        </Page>
    )
}