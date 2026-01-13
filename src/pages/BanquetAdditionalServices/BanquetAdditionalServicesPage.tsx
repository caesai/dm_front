/**
 * @fileoverview Страница выбора дополнительных услуг для банкета.
 * 
 * Четвёртый (опциональный) шаг в процессе бронирования банкета:
 * 1. BanquetAddressPage (выбор ресторана)
 * 2. ChooseBanquetOptionsPage (выбор опции банкета)
 * 3. BanquetOptionPage (настройка банкета)
 * 4. BanquetAdditionalServicesPage (дополнительные услуги) <- текущая страница
 * 5. BanquetReservationPage (подтверждение)
 * 
 * Функциональность страницы:
 * - Отображение списка доступных дополнительных услуг в виде чекбоксов
 * - Выбор/отмена услуг через toggle
 * - Сохранение выбранных услуг в banquetFormAtom
 * - Переход на страницу подтверждения бронирования
 * 
 * Особенности логики:
 * - Данные загружаются из banquetFormAtom через useBanquetForm hook
 * - При отсутствии дополнительных услуг автоматический редирект на резервацию
 * - При переходе далее устанавливается withAdditionalPage: true
 * - Услуги не входят в стоимость и оплачиваются отдельно
 * 
 * @module pages/BanquetAdditionalServicesPage
 * 
 * @see {@link BanquetOptionPage} - предыдущий шаг (настройка банкета)
 * @see {@link BanquetReservationPage} - следующий шаг (подтверждение)
 * @see {@link useBanquetForm} - хук управления данными банкета
 */
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Types
import { IBanquetAdditionalOptions } from '@/types/banquets.types.ts';
// Hooks
import { useBanquetForm } from '@/hooks/useBanquetForm.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { BanquetCheckbox } from '@/components/BanquetCheckbox/BanquetCheckbox.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// Styles
import css from '@/pages/BanquetAdditionalServices/BanquetAdditionalServicesPage.module.css';

/**
 * Страница выбора дополнительных услуг для банкета.
 * 
 * Отображает список дополнительных услуг в виде чекбоксов.
 * Пользователь может выбрать любое количество услуг.
 * При отсутствии доступных услуг происходит автоматический редирект
 * на страницу бронирования.
 * 
 * @returns {JSX.Element} - Компонент страницы выбора дополнительных услуг
 * 
 * @example
 * // URL: /banquets/:restaurantId/additional-services/:optionId
 * // Данные загружаются из banquetFormAtom через useBanquetForm
 */
export const BanquetAdditionalServicesPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { restaurantId, optionId } = useParams();
    const { form, handlers, navigateToReservation } = useBanquetForm();
    
    /** Список доступных дополнительных услуг из формы */
    const additionalOptions: IBanquetAdditionalOptions[] = form.additionalOptions || [];
    /** Список названий выбранных услуг */
    const selectedServices = form.selectedServices;

    /**
     * Навигация назад на страницу настройки банкета.
     */
    const goBack = () => {
        navigate(`/banquets/${restaurantId}/option/${optionId}`);
    };

    /**
     * Обработка перехода на страницу бронирования.
     * 
     * Действия:
     * 1. Устанавливает withAdditionalPage: true в форме
     * 2. Навигирует на страницу BanquetReservationPage
     */
    const goNext = () => {
        handlers.updateField({ withAdditionalPage: true });
        navigateToReservation();
    };

    /**
     * Эффект автоматического редиректа при отсутствии услуг.
     * 
     * Если дополнительные услуги отсутствуют (пустой массив или undefined),
     * пользователь автоматически перенаправляется на страницу бронирования.
     */
    useEffect(() => {
        if (!additionalOptions || additionalOptions.length === 0) {
            navigateToReservation();
        }
    }, [additionalOptions, navigateToReservation]);
    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>Дополнительные услуги</span>
                        <div />
                    </div>
                    <ContentContainer >
                        <ContentBlock>
                            <div className={css.checkbox}>
                                {additionalOptions && additionalOptions.length > 0 && (
                                    additionalOptions.map((option: IBanquetAdditionalOptions) => (
                                        <BanquetCheckbox
                                            key={option.id}
                                            checked={selectedServices.includes(option.name)}
                                            toggle={() => handlers.toggleService(option.name)}
                                            label={option.name}
                                        />
                                    ))
                                )}
                            </div>
                        </ContentBlock>
                        <ContentBlock>
                            <span className={css.text}>Не входит в стоимость, оплачивается отдельно</span>
                        </ContentBlock>
                    </ContentContainer>
                    <div className={css.button}>
                        <UniversalButton
                            width={'full'}
                            title={'Продолжить'}
                            theme={'red'}
                            action={goNext}
                        />
                    </div>
                </div>
            </div>
        </Page>
    )
}
