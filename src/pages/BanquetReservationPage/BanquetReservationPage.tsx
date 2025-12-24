import { Page } from '@/components/Page.tsx';
import css from './BanquetReservation.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useState } from 'react';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { useAtom } from 'jotai';
import { APIPostBanquetRequest } from '@/api/banquet.api.ts';
import moment from 'moment';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import useToastState from '@/hooks/useToastState.ts';

export const BanquetReservationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const [user] = useAtom(userAtom)
    const [auth] = useAtom(authAtom);
    const { showToast } = useToastState();
    const reservationData = location.state?.reservationData || location.state;

    const confirmationList = [
        {
            id: 'telegram',
            text: 'В Telegram',
        },
        {
            id: 'phone',
            text: 'По телефону',
        },
    ]

    const {
        date,
        timeFrom,
        timeTo,
        guestCount,
        currentRestaurant,
        reason,
        selectedServices = [],
        price,
        withAdditionalPage,
    } = reservationData;
    
    const [commentary, setCommentary] = useState<string>('');
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });

    const goBack = () => {
        if (withAdditionalPage) {
            navigate(`/banquets/${id}/additional-services`, { state: { ...location.state, selectedServices } });
        }
        else {
            navigate(`/banquets/${id}/option`, { state: { ...location.state } });
        }
    }
    const formattedDate = new Date(date).toLocaleDateString('ru-RU')
    const formatNumber = (number: string) => {
        return number[0] === '7' ?  `+ ${number}` : number
    }

    const services = selectedServices.length > 0
        ? selectedServices.map((service: string, index: number) => index !== 0 ? service.toLowerCase() : service).join(', ')
        : 'Не выбраны';

    const createBooking = () => {
        if (!auth?.access_token) return;
        APIPostBanquetRequest(auth?.access_token, {
            restaurant_id: Number(id),
            banquet_option: reservationData.name,
            date: moment(date).toISOString(),
            start_time: timeFrom,
            end_time: timeTo,
            guests_count: guestCount.value,
            occasion: reason,
            additional_services: selectedServices,
            comment: commentary,
            contact_method: confirmation.id,
            estimated_cost: price.total,
        }).then(res => {
            //
            if (res.data.status === 'success') {
                showToast('Ваш запрос на бронирование банкета принят. Наш менеджер скоро свяжется с вами.');
                navigate('/');
            }
        })
    }

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    ></RoundedButton>
                    <span className={css.header_title}>{currentRestaurant.title}</span>
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
                                        <span>Желаемая дата</span>
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div>
                                        <span>Гости</span>
                                        <span>{guestCount?.title}</span>
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
                            <TextInput
                                value={commentary}
                                onChange={(e) => {
                                    setCommentary(e);
                                }}
                                placeholder={'Введите комментарий'}
                            />
                        </div>
                    </ContentBlock>
                    <ContentBlock>
                        <div className={css.connect}>
                            <ConfirmationSelect
                                options={confirmationList}
                                currentValue={confirmation}
                                onChange={setConfirmation}
                                title={<span className={css.connect_title}>Способ связи</span>}
                            />
                        </div>
                    </ContentBlock>
                    {price.deposit !== null && (
                        <ContentBlock>
                            <span className={css.price_title}>Предварительная стоимость*:</span>
                            <div className={css.price}>
                                <div>
                                    <span>Депозит за человека:</span>
                                    <span>{price?.deposit} ₽</span>
                                </div>
                                <div>
                                    <span>Депозит итого:</span>
                                    <span>{price?.totalDeposit} ₽</span>
                                </div>
                                <div>
                                    <span>Сервисный сбор:</span>
                                    <span>{price?.serviceFee}%</span>
                                </div>
                                <div>
                                    <span>Итого:</span>
                                    <span>{price?.total} ₽</span>
                                </div>
                                <p>
                                    *Окончательная стоимость банкета будет
                                    определена после того, как вы сформируете запрос,
                                    и мы свяжемся с вами для уточнения всех деталей мероприятия.
                                </p>
                            </div>
                        </ContentBlock>
                    )}
                    <div className={css.button}>
                        <UniversalButton
                            width={'full'}
                            title={'Забронировать'}
                            theme={'red'}
                            action={createBooking}
                        />
                    </div>
                </ContentContainer>

            </div>
        </Page>
    )
}
