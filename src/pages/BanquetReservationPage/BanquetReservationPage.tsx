/**
 * @fileoverview Страница подтверждения бронирования банкета.
 * 
 * Пятый (финальный) шаг в процессе бронирования банкета:
 * 1. BanquetAddressPage (выбор ресторана)
 * 2. ChooseBanquetOptionsPage (выбор опции банкета)
 * 3. BanquetOptionPage (настройка банкета)
 * 4. BanquetAdditionalServicesPage (дополнительные услуги) - опционально
 * 5. BanquetReservationPage (подтверждение) <- текущая страница
 * 
 * Функциональность страницы:
 * - Отображение сводки всех введённых данных о бронировании
 * - Информация о пользователе (имя, телефон)
 * - Ввод комментария к бронированию
 * - Выбор способа связи (Telegram/телефон)
 * - Отображение предварительной стоимости
 * - Отправка запроса на бронирование
 * 
 * Особенности логики:
 * - Данные загружаются из banquetFormAtom через useBanquetForm hook
 * - Навигация назад зависит от withAdditionalPage флага
 * - При успешном бронировании: показ toast, сброс формы, редирект на главную
 * - Блок стоимости скрывается при отсутствии price или deposit
 * 
 * @module pages/BanquetReservationPage
 * 
 * @see {@link BanquetAdditionalServicesPage} - предыдущий шаг (опционально)
 * @see {@link BanquetOptionPage} - предыдущий шаг (если нет доп. услуг)
 * @see {@link useBanquetForm} - хук управления данными банкета
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Types
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
// Hooks
import { useBanquetForm } from '@/hooks/useBanquetForm.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
// Styles
import css from '@/pages/BanquetReservationPage/BanquetReservation.module.css';

/**
 * Страница подтверждения бронирования банкета.
 * 
 * Отображает полную сводку данных бронирования и позволяет
 * пользователю добавить комментарий, выбрать способ связи
 * и отправить запрос на бронирование.
 * 
 * @returns {JSX.Element} - Компонент страницы подтверждения бронирования
 * 
 * @example
 * // URL: /banquets/:restaurantId/reservation
 * // Данные (включая optionId) загружаются из banquetFormAtom через useBanquetForm
 * 
 * @remarks
 * optionId не передаётся через URL, а берётся из формы (banquetFormAtom),
 * куда он был сохранён на этапе BanquetOptionPage. Это обеспечивает
 * корректную навигацию назад независимо от URL.
 */
export const BanquetReservationPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const user = useAtomValue(userAtom);
    const { form, createBanquetRequest } = useBanquetForm();

    /** Доступные способы связи для подтверждения бронирования */
    const confirmationList = [
        {
            id: 'telegram',
            text: 'В Telegram',
        },
        {
            id: 'phone',
            text: 'По телефону',
        },
    ];

    /** 
     * Деструктуризация данных формы бронирования.
     * optionId берётся из формы, а не из useParams(),
     * так как URL /banquets/:restaurantId/reservation не содержит optionId.
     */
    const {
        date,
        timeFrom,
        timeTo,
        guestCount,
        currentRestaurant,
        reason,
        selectedServices,
        price,
        withAdditionalPage,
        optionId,
    } = form;
    
    /** Комментарий пользователя к бронированию */
    const [commentary, setCommentary] = useState<string>('');
    /** Выбранный способ связи */
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });

    /**
     * Навигация назад.
     * 
     * Логика:
     * - При withAdditionalPage=true -> на страницу дополнительных услуг
     * - При withAdditionalPage=false -> на страницу настройки банкета
     */
    const goBack = () => {
        if (withAdditionalPage) {
            navigate(`/banquets/${restaurantId}/additional-services/${optionId}`);
        } else {
            navigate(`/banquets/${restaurantId}/option/${optionId}`);
        }
    };
    
    /** Форматированная дата в формате DD.MM.YYYY */
    const formattedDate = date ? new Date(date).toLocaleDateString('ru-RU') : '';
    
    /**
     * Форматирует номер телефона для отображения.
     * Добавляет "+ " перед номерами, начинающимися с 7.
     * 
     * @param number - Номер телефона
     * @returns Отформатированный номер
     */
    const formatNumber = (number: string) => {
        return number[0] === '7' ? `+ ${number}` : number;
    };

    /**
     * Форматированный список выбранных услуг.
     * Первая услуга с заглавной буквы, остальные - строчными.
     * При отсутствии услуг - "Не выбраны".
     */
    const services = selectedServices.length > 0
        ? selectedServices.map((service: string, index: number) => index !== 0 ? service.toLowerCase() : service).join(', ')
        : 'Не выбраны';

    /**
     * Создаёт запрос на бронирование банкета.
     * 
     * Вызывает createBanquetRequest из useBanquetForm с:
     * - Комментарием пользователя
     * - Выбранным способом связи
     * 
     * При успехе: toast с подтверждением, сброс формы, редирект на главную.
     */
    const createBooking = () => {
        createBanquetRequest(commentary, confirmation.id);
    };

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    ></RoundedButton>
                    <span className={css.header_title}>{currentRestaurant?.title}</span>
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
                                        <span>{guestCount?.title as string}</span>
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
                    {price && price.deposit !== null && (
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
